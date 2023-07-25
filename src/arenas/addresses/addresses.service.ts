import { Injectable } from '@nestjs/common';
import { Address } from '@prisma/client';

import { CreateAddressDto } from './dtos/create-address.dto';
import { PrismaService } from '../../prisma.service';

@Injectable()
export class AddressesService {
  constructor(private readonly prisma: PrismaService) {}
  public async create({
    description,
    lat,
    lon,
  }: CreateAddressDto): Promise<Address> {
    return this.prisma.address.create({
      data: {
        description,
        lat,
        lon,
      },
    });
  }

  public async delete(id: string) {
    return this.prisma.address.delete({ where: { id } });
  }
}
