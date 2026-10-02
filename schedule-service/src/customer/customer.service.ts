import { ConflictException, Inject, Injectable, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { Cache } from 'cache-manager';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';
import { CustomerPaginationResult } from './models/customer-pagination.model';

@Injectable()
export class CustomerService {
  constructor(
    private readonly prisma: PrismaService,
    @Inject(CACHE_MANAGER) private readonly cacheManager: Cache,
  ) {}

  async findAll(page: number = 1, limit: number = 10): Promise<CustomerPaginationResult> {
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);
    const cacheKey = `customers_page_${validPage}_limit_${validLimit}`;

    try {
      const cached = (await this.cacheManager.get(cacheKey)) as CustomerPaginationResult;
      if (cached) {
        return cached;
      }
    } catch {
      // Fallthrough
    }

    const skip = (validPage - 1) * validLimit;
    const [data, total] = await Promise.all([
      this.prisma.customer.findMany({
        skip,
        take: validLimit,
        orderBy: { createdAt: 'desc' },
      }),
      this.prisma.customer.count(),
    ]);

    const totalPages = Math.ceil(total / validLimit) || 0;
    const result: CustomerPaginationResult = {
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
    const customer = await this.prisma.customer.findUnique({
      where: { id },
    });

    if (!customer) {
      throw new NotFoundException(`Pelanggan dengan ID '${id}' tidak ditemukan`);
    }

    return customer;
  }

  async create(createCustomerInput: CreateCustomerInput) {
    const existing = await this.prisma.customer.findUnique({
      where: { email: createCustomerInput.email },
    });

    if (existing) {
      throw new ConflictException('Email pelanggan sudah terdaftar');
    }

    const created = await this.prisma.customer.create({
      data: createCustomerInput,
    });

    this.clearCache();
    return created;
  }

  async update(id: string, updateCustomerInput: UpdateCustomerInput) {
    await this.findOne(id);

    if (updateCustomerInput.email) {
      const existing = await this.prisma.customer.findUnique({
        where: { email: updateCustomerInput.email },
      });

      if (existing && existing.id !== id) {
        throw new ConflictException('Email pelanggan sudah terdaftar');
      }
    }

    const updated = await this.prisma.customer.update({
      where: { id },
      data: updateCustomerInput,
    });

    this.clearCache();
    return updated;
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.customer.delete({
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
