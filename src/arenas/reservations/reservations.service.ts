import {
  BadRequestException,
  Injectable,
  UnprocessableEntityException,
} from '@nestjs/common';
import {
  getDate,
  getDay,
  getDaysInMonth,
  getHours,
  isAfter,
  isBefore,
  parseISO,
  startOfHour,
} from 'date-fns';
import { zonedTimeToUtc } from 'date-fns-tz';
import { getDistance } from 'geolib';
import moment from 'moment';

import 'moment-timezone';
import { CreateReservationDto } from './dtos/create-reservation.dto';
import { FindAllInMonthFromArenaDto } from './dtos/find-all-in-month-from-arena.dto';
import { ReservationStatus } from './enums/reservation-status.enum';
import { CreateReservationResponse } from './interfaces/create-reservation.response.interface';
import {
  FindAllInDayCourt,
  FindAllInDayResponse,
} from './interfaces/find-all-in-day.response.interface';
import { FindByUserResponse } from './interfaces/find-by-user.response.interface';
import { ResultsEnum } from '../../common/results.enum';
import { PrismaService } from '../../prisma.service';
import { getWeekNumber } from '../utils/get-week-number';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

  public async findByUser(user_id: string): Promise<FindByUserResponse[]> {
    const reservation = await this.prisma.reservation.findMany({
      where: { user_id },
      include: {
        court: {
          include: { arena: true },
        },
      },
    });

    return reservation.map((reservation) => {
      return {
        id: reservation.id,
        date: reservation.date,
        court: reservation.court.name,
        court_id: reservation.court_id,
        sport_type: reservation.court.sport_type,
        arena: reservation.court.arena.name,
        arena_id: reservation.court.arena.id,
        status: reservation.status,
      };
    });
  }

  public async findByDate(date: Date, court_id: string) {
    return this.prisma.reservation.findFirst({
      where: { id: court_id, date },
    });
  }

  public async findAllInMonthFromArena({
    arena_id,
    month,
    year,
  }: FindAllInMonthFromArenaDto) {
    const startDate = new Date(year, month - 1, 1);
    const endDate = new Date(year, month, 1);

    const reservations = await this.prisma.reservation.findMany({
      where: {
        date: {
          gte: startDate,
          lt: endDate,
        },
      },
      include: {
        court: {
          include: { arena: true },
        },
      },
    });

    const numberOfDaysInMonth = getDaysInMonth(new Date(year, month - 1));
    const eachDayArray = Array.from(
      { length: numberOfDaysInMonth },
      (_, index) => index + 1,
    );

    return eachDayArray.map((day) => {
      const compareDate = new Date(year, month - 1, day, 23, 59, 59);

      const appointmentsInDay = reservations.filter((reservation) => {
        return getDate(reservation.date) === day;
      });

      return {
        day,
        available:
          isAfter(compareDate, new Date(Date.now())) &&
          appointmentsInDay.length < 10,
      };
    });
  }

  public async findAllInDay(
    date: Date,
    latitude: number,
    longitude: number,
    only_available?: boolean,
    arena_id?: string,
    filter?: 'TIMES_NEXT' | 'CHEAPEST_SCHEDULE',
  ): Promise<FindAllInDayResponse[]> {
    const currentTime = getHours(date);
    const day = date.getDate(); // Dia fornecido pelo usuário
    const month = date.getMonth(); // Mês fornecido pelo usuário
    const year = date.getFullYear(); // Ano fornecido pelo usuário

    const reservations = await this.prisma.arena.findMany({
      include: {
        address: true,
        opening_hours: true,
        courts: {
          include: {
            reservations: true,
          },
        },
      },
      where: {
        courts: {
          some: {
            id: {
              not: undefined,
            },
          },
        },
        // Filtra pela arena informada, caso seja informado
        ...(arena_id && {
          id: arena_id,
        }),
      },
    });

    const sortCourtsByClosestTime = (
      courtA: FindAllInDayCourt,
      courtB: FindAllInDayCourt,
    ) => {
      const availableTimeA = courtA.available_times.find(
        (timeSlot) => timeSlot.available && timeSlot.hour >= currentTime,
      );
      const availableTimeB = courtB.available_times.find(
        (timeSlot) => timeSlot.available && timeSlot.hour >= currentTime,
      );

      if (!availableTimeA) return 1;
      if (!availableTimeB) return -1;

      return availableTimeA.hour - availableTimeB.hour;
    };

    const sortCourtsByCheapestSchedule = (
      courtA: FindAllInDayCourt,
      courtB: FindAllInDayCourt,
    ) => {
      const cheapestValueA = Math.min(
        ...courtA.available_times
          .filter((timeSlot) => timeSlot.available)
          .map(() => courtA.value_per_hour),
      );

      const cheapestValueB = Math.min(
        ...courtB.available_times
          .filter((timeSlot) => timeSlot.available)
          .map(() => courtB.value_per_hour),
      );

      return cheapestValueA - cheapestValueB;
    };

    const nearbyArenas = reservations.filter((arena) => {
      const distance = getDistance(
        { latitude, longitude },
        {
          latitude: arena.address.lat.toString(),
          longitude: arena.address.lon.toString(),
        },
      );
      return distance <= 25000; // 25 km em metros
    });

    return nearbyArenas.map((arena) => {
      const hasOpeningTime = arena.opening_hours.length > 0;
      //Não deve retornar arenas que não possuem horários de abertura e fechamento cadastrado
      if (!hasOpeningTime) {
        return undefined;
      }

      //Pega o horário de funcionamento para o dia!
      const hours = arena.opening_hours.filter(
        (hour) =>
          getWeekNumber(hour.week_day.toString()) ===
          getDay(new Date(year, month - 1, day)),
      );

      if (hours.length <= 0) {
        return undefined;
      }
      const horariosArray = [];

      for (let i = hours[0].opening; i < hours[0].closing; i++) {
        if (
          (hours[0].lunch_closing === undefined ||
            i !== hours[0].lunch_closing) &&
          (hours[0].lunch_opening === undefined || i !== hours[0].lunch_opening)
        ) {
          horariosArray.push(i);
        }
      }
      const courts = arena.courts.map((court) => {
        const reservationsOnDate = court.reservations.filter((reservation) => {
          const reservationDate = new Date(reservation.date);
          return (
            reservationDate.getFullYear() === year &&
            reservationDate.getMonth() === month &&
            reservationDate.getDate() === day
          );
        });
        const available_times = horariosArray.map((hour) => {
          const hasReservationInHour = reservationsOnDate.some(
            (reservation) => {
              const znDate = zonedTimeToUtc(
                reservation.date,
                'America/Sao_Paulo',
              );
              return znDate.getUTCHours() === hour;
            },
          );

          return {
            hour,
            available: !hasReservationInHour,
          };
        });

        return {
          court: court.name,
          court_id: court.id,
          sport_type: court.sport_type,
          value_per_hour: Number(court.value_per_hour),
          available_times,
        };
      });

      if (filter === 'TIMES_NEXT') {
        courts.sort(sortCourtsByClosestTime);
      }
      if (filter === 'CHEAPEST_SCHEDULE') {
        courts.sort(sortCourtsByCheapestSchedule);
      }

      if (only_available) {
        const availableCourts = courts.filter((court) =>
          court.available_times.some((timeSlot) => timeSlot.available === true),
        );

        return {
          arena: arena.name,
          arena_id: arena.id,
          courts: availableCourts,
        };
      }

      return {
        arena: arena.name,
        arena_id: arena.id,
        courts,
      };
    });
  }

  public async createReservation(
    { date, court_id }: CreateReservationDto,
    user_id: string,
  ): Promise<CreateReservationResponse> {
    const parsedDate = parseISO(date);

    const reservationDate = startOfHour(parsedDate);
    const court = await this.prisma.court.findUnique({
      where: { id: court_id },
      include: {
        arena: {
          include: {
            opening_hours: true,
          },
        },
      },
    });

    if (court.arena.opening_hours.length <= 0) {
      //Times for this arena have not been set
      throw new BadRequestException(
        ResultsEnum.TimesForThisArenaHaveNotBeenSet.toString(),
      );
    }

    const now = moment().tz('America/Sao_Paulo').toISOString();

    if (isBefore(parsedDate, parseISO(now))) {
      //Can't create an registration on a past date
      throw new BadRequestException(
        ResultsEnum.CantCreateRegistrationOnPastDate.toString(),
      );
    }

    const findHours = court.arena.opening_hours.filter((hour) => {
      const weekday = hour.week_day;
      if (getWeekNumber(weekday.toString()) === getDay(parsedDate)) {
        return true;
      }
    });

    if (findHours.length < 0) {
      //arena not open for the given date
      throw new BadRequestException(
        ResultsEnum.ArenaNotOpenForTheGivenDate.toString(),
      );
    }

    if (
      getHours(reservationDate) < findHours[0].opening ||
      getHours(reservationDate) > findHours[0].closing
    ) {
      //You can only create reservation on business hours
      throw new BadRequestException(
        ResultsEnum.YCOCreateReservationOnBusinessHours.toString(),
      );
    }

    if (
      findHours[0].lunch_closing !== undefined &&
      findHours[0].lunch_opening !== undefined
    ) {
      if (
        getHours(reservationDate) >= findHours[0].lunch_closing &&
        getHours(reservationDate) <= findHours[0].lunch_opening
      ) {
        //you can only book during opening hours
        throw new BadRequestException(ResultsEnum.YCOBookDuringOpeningHours);
      }
    }

    const findReservationInSameDate = await this.prisma.reservation.findFirst({
      where: {
        date: reservationDate,
        court_id,
        status: {
          notIn: ['CANCELLED_BY_TRANSACTION', 'CANCELLED_BY_USER'],
        },
      },
    });

    if (findReservationInSameDate) {
      //There is already a reservation for this time
      throw new UnprocessableEntityException(
        ResultsEnum.ThereAlreadyReservationForThisTime.toString(),
      );
    }

    //TODO: IMPLEMENTAR LOGICA DE NOTIFICACAO
    const reservation = await this.prisma.reservation.create({
      data: {
        user_id,
        court_id,
        date,
      },
    });

    return {
      id: reservation.id,
      date: reservation.date,
      court: court.name,
      court_id: reservation.court_id,
      sport_type: court.sport_type,
      arena: court.arena.name,
      arena_id: court.arena.id,
      status: reservation.status,
      link: 'LINK_REDIRECT_BROWSER',
    };
  }
}
