import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleInput } from './dto/create-schedule.input';
import { ScheduleFilterInput } from './dto/schedule-filter.input';

@Injectable()
export class ScheduleService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10, filter?: ScheduleFilterInput) {
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);
    const skip = (validPage - 1) * validLimit;

    const where: any = {};
    if (filter?.doctorId) {
      where.doctorId = filter.doctorId;
    }
    if (filter?.customerId) {
      where.customerId = filter.customerId;
    }
    if (filter?.dateFrom || filter?.dateTo) {
      where.scheduledAt = {};
      if (filter.dateFrom) {
        where.scheduledAt.gte = filter.dateFrom;
      }
      if (filter.dateTo) {
        where.scheduledAt.lte = filter.dateTo;
      }
    }

    const [data, total] = await Promise.all([
      this.prisma.schedule.findMany({
        where,
        skip,
        take: validLimit,
        orderBy: { scheduledAt: 'asc' },
      }),
      this.prisma.schedule.count({ where }),
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
    const schedule = await this.prisma.schedule.findUnique({
      where: { id },
    });

    if (!schedule) {
      throw new NotFoundException(`Jadwal dengan ID '${id}' tidak ditemukan`);
    }

    return schedule;
  }

  async create(createScheduleInput: CreateScheduleInput) {
    const { customerId, doctorId, scheduledAt, objective } = createScheduleInput;

    const customer = await this.prisma.customer.findUnique({
      where: { id: customerId },
    });

    if (!customer) {
      throw new NotFoundException('Customer not found');
    }

    const doctor = await this.prisma.doctor.findUnique({
      where: { id: doctorId },
    });

    if (!doctor) {
      throw new NotFoundException('Doctor not found');
    }

    const existingSchedule = await this.prisma.schedule.findFirst({
      where: {
        doctorId,
        scheduledAt,
      },
    });

    if (existingSchedule) {
      throw new ConflictException('Doctor already has a schedule at this time');
    }

    return this.prisma.schedule.create({
      data: {
        objective,
        customerId,
        doctorId,
        scheduledAt,
      },
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.schedule.delete({
      where: { id },
    });
    return true;
  }
}
