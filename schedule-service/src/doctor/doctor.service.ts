import { Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorInput } from './dto/create-doctor.input';
import { UpdateDoctorInput } from './dto/update-doctor.input';

@Injectable()
export class DoctorService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10) {
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);
    const skip = (validPage - 1) * validLimit;

    const [data, total] = await Promise.all([
      this.prisma.doctor.findMany({
        skip,
        take: validLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.doctor.count(),
    ]);

    const totalPages = Math.ceil(total / validLimit) || 0;

    return {
      data,
      total,
      page: validPage,
      limit: validLimit,
      totalPages,
    };
  }

  async findOne(id: string) {
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException(`Dokter dengan ID '${id}' tidak ditemukan`);
    }

    return doctor;
  }

  async create(createDoctorInput: CreateDoctorInput) {
    return this.prisma.doctor.create({
      data: createDoctorInput,
    });
  }

  async update(id: string, updateDoctorInput: UpdateDoctorInput) {
    await this.findOne(id);
    return this.prisma.doctor.update({
      where: { id },
      data: updateDoctorInput,
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.doctor.delete({
      where: { id },
    });
    return true;
  }
}
