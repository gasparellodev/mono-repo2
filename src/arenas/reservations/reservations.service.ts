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
import moment from 'moment';

import 'moment-timezone';
import { CreateReservationDto } from './dtos/create-reservation.dto';
import { FindAllInMonthFromArenaDto } from './dtos/find-all-in-month-from-arena.dto';
import { ResultsEnum } from '../../common/results.enum';
import { PrismaService } from '../../prisma.service';
import { WeekDays } from '../opening-hours/enums/week-days.enum';
import { getWeekNumber } from '../utils/get-week-number';

@Injectable()
export class ReservationsService {
  constructor(private readonly prisma: PrismaService) {}

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

  public async findAllInDay() {
    const day = 22; // Dia fornecido pelo usuário
    const month = 6; // Mês fornecido pelo usuário
    const year = 2023; // Ano fornecido pelo usuário

    const reservations = await this.prisma.arena.findMany({
      include: {
        opening_hours: true,
        courts: {
          include: {
            reservations: true,
          },
        },
      },
    });

    return reservations.map((arena) => {
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
            reservationDate.getMonth() === month - 1 &&
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
          available_times,
        };
      });

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
  ) {
    const parsedDate = parseISO(date);
    console.log(parsedDate);
    const reservationDate = startOfHour(parsedDate);
    console.log(reservationDate);
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

    console.log(now, parsedDate, isBefore(parsedDate, parseISO(now)));

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
    return this.prisma.reservation.create({
      data: {
        user_id,
        court_id,
        date,
      },
    });
  }
}
