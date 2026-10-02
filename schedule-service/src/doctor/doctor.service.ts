import { Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateDoctorInput } from './dto/create-doctor.input';
import { UpdateDoctorInput } from './dto/update-doctor.input';
import { DoctorPaginationResult } from './models/doctor-pagination.model';

@Injectable()
export class DoctorService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<DoctorPaginationResult> {
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);
    const cacheKey = `doctors_page_${validPage}_limit_${validLimit}`;

    try {
      const cached = (await this.cacheManager.get(cacheKey)) as DoctorPaginationResult;
      if (cached) {
        return cached;
      }
    } catch {
      // Fallthrough
    }

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
    const result: DoctorPaginationResult = {
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
    const doctor = await this.prisma.doctor.findUnique({
      where: { id },
    });

    if (!doctor) {
      throw new NotFoundException(`Dokter dengan ID '${id}' tidak ditemukan`);
    }

    return doctor;
  }

  async create(createDoctorInput: CreateDoctorInput) {
    const created = await this.prisma.doctor.create({
      data: createDoctorInput,
    });
    this.clearCache();
    return created;
  }

  async update(id: string, updateDoctorInput: UpdateDoctorInput) {
    await this.findOne(id);
    const updated = await this.prisma.doctor.update({
      where: { id },
      data: updateDoctorInput,
    });
    this.clearCache();
    return updated;
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.doctor.delete({
      where: { id },
    });
    this.clearCache();
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
