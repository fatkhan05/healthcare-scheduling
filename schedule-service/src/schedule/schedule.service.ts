import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { InjectQueue } from '@nestjs/bull';
import { Queue } from 'bull';
import { PrismaService } from '../prisma/prisma.service';
import { CreateScheduleInput } from './dto/create-schedule.input';
import { ScheduleFilterInput } from './dto/schedule-filter.input';
import { SchedulePaginationResult } from './models/schedule-pagination.model';

@Injectable()
export class ScheduleService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
    @InjectQueue('notification') private readonly notificationQueue: Queue,
  ) {}

  async findAll(page: number = 1, limit: number = 10, filter?: ScheduleFilterInput): Promise<SchedulePaginationResult> {
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);
    const cacheKey = `schedules_page_${validPage}_limit_${validLimit}_${JSON.stringify(filter || {})}`;

    try {
      const cached = (await this.cacheManager.get(cacheKey)) as SchedulePaginationResult;
      if (cached) {
        return cached;
      }
    } catch {
      // Fallthrough
    }

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
    const result: SchedulePaginationResult = {
      data,
      total,
      page: validPage,
      limit: validLimit,
      totalPages,
    };

    try {
      await this.cacheManager.set(cacheKey, result, 60000);
    } catch {
      // Fallthrough
    }

    return result;
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

    const newSchedule = await this.prisma.schedule.create({
      data: {
        objective,
        customerId,
        doctorId,
        scheduledAt,
      },
    });

    this.clearCache();

    try {
      if (this.notificationQueue) {
        await this.notificationQueue.add('send-schedule-email', {
          to: customer.email,
          subject: 'Konfirmasi Jadwal Konsultasi',
          type: 'CREATE',
          customerName: customer.name,
          doctorName: doctor.name,
          scheduledAt: newSchedule.scheduledAt.toISOString(),
          objective: newSchedule.objective,
        });
      }
    } catch {
      // Ignore
    }

    return newSchedule;
  }

  async delete(id: string) {
    const schedule = await this.findOne(id);

    const [customer, doctor] = await Promise.all([
      this.prisma.customer.findUnique({ where: { id: schedule.customerId } }),
      this.prisma.doctor.findUnique({ where: { id: schedule.doctorId } }),
    ]);

    await this.prisma.schedule.delete({
      where: { id },
    });

    this.clearCache();

    try {
      if (this.notificationQueue && customer && doctor) {
        await this.notificationQueue.add('send-schedule-email', {
          to: customer.email,
          subject: 'Pembatalan Jadwal Konsultasi',
          type: 'DELETE',
          customerName: customer.name,
          doctorName: doctor.name,
          scheduledAt: schedule.scheduledAt.toISOString(),
          objective: schedule.objective,
        });
      }
    } catch {
      // Ignore
    }

    return true;
  }

  private async clearCache() {
    try {
      if (typeof (this.cacheManager as any).reset === 'function') {
        await (this.cacheManager as any).reset();
      }
    } catch {
      // Ignore
    }
  }
}
