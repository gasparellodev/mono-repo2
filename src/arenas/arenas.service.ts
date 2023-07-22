import { BadRequestException, Injectable } from '@nestjs/common';
import { Arena } from '@prisma/client';
import { getDistance } from 'geolib';

import { AddressesService } from './addresses/addresses.service';
import { CreateArenaDto } from './dtos/create-arena.dto';
import { ResultsEnum } from '../common/results.enum';
import { PrismaService } from '../prisma.service';

@Injectable()
export class ArenasService {
  constructor(
    private readonly prisma: PrismaService,
    private readonly _addressesService: AddressesService,
  ) {}

  public async get(owner_id: string): Promise<Arena> {
    return this.prisma.arena.findFirst({ where: { owner_id } });
  }

  public async searchByLocation(
    longitude: number,
    latitude: number,
    search: string,
  ) {
    const arenas = await this.prisma.arena.findMany({
      where: {
        name: {
          contains: search,
        },
        courts: {
          some: {
            id: {
              not: null,
            },
          },
        },
        is_validated: {
          not: null,
        },
      },
      include: {
        address: true,
      },
    });

    const nearbyArenas = arenas.filter((arena) => {
      const distance = getDistance(
        { latitude, longitude },
        {
          latitude: arena.address.lat.toString(),
          longitude: arena.address.lon.toString(),
        },
      );
      return distance <= 50000; // 50 km em metros
    });

    return nearbyArenas
      .map((arena) => ({
        id: arena.id,
        name: arena.name,
        distance: getDistance(
          { latitude, longitude },
          {
            latitude: arena.address.lat.toString(),
            longitude: arena.address.lon.toString(),
          },
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }

  public async create(
    { name, cnpj, phone, description, lat, lon }: CreateArenaDto,
    owner_id: string,
  ): Promise<Arena> {
    // Verificar se o usuário é do tipo "ARENA"
    const owner = await this.prisma.user.findUnique({
      where: { id: owner_id },
    });
    if (owner.role !== 'ARENA') {
      throw new BadRequestException(
        ResultsEnum.OwnerMustBeArenaType.toString(),
      );
    }

    // Verificar se o CNPJ já existe
    const arenaExists = await this.prisma.arena.findUnique({ where: { cnpj } });
    if (arenaExists) {
      throw new BadRequestException(ResultsEnum.CNPJAlreadyExists.toString());
    }

    // Cadastrar o endereço
    let address;
    try {
      address = await this._addressesService.create({ description, lat, lon });
    } catch (e) {
      throw new BadRequestException(
        ResultsEnum.ErrorRegisteringAddress.toString(),
      );
    }

    // Cadastrar a arena
    let arena;
    try {
      arena = await this.prisma.arena.create({
        data: {
          name,
          cnpj,
          phone,
          address_id: address.id,
          owner_id,
        },
      });
    } catch (e) {
      // Caso o cadastro de arena falhe, fazer rollback no cadastro de endereço
      await this._addressesService.delete(address.id);
      throw new BadRequestException(
        ResultsEnum.ErrorRegisteringArena.toString(),
      );
    }

    return arena;
  }

  public async getNearbyArenas(latitude: number, longitude: number) {
    const arenas = await this.prisma.arena.findMany({
      where: {
        is_validated: {
          not: null,
        },
      },
      include: {
        address: true,
        courts: {
          include: { reservations: true },
        },
      },
    });

    const filterWithRegisteredCourts = arenas.filter(
      (item) => item.courts.length > 0,
    );

    // Filtra as arenas que estão a no máximo 15 km de distância das coordenadas informadas
    const nearbyArenas = filterWithRegisteredCourts.filter((arena) => {
      const distance = getDistance(
        { latitude, longitude },
        {
          latitude: arena.address.lat.toString(),
          longitude: arena.address.lon.toString(),
        },
      );
      return distance <= 15000; // 15 km em metros
    });

    return nearbyArenas
      .map((arena) => ({
        id: arena.id,
        name: arena.name,
        distance: getDistance(
          { latitude, longitude },
          {
            latitude: arena.address.lat.toString(),
            longitude: arena.address.lon.toString(),
          },
        ),
      }))
      .sort((a, b) => a.distance - b.distance);
  }
}
