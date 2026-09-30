import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { PrismaService } from '../prisma/prisma.service';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';

@Injectable()
export class CustomerService {
  constructor(private readonly prisma: PrismaService) {}

  async findAll(page: number = 1, limit: number = 10) {
    const validPage = Math.max(1, page);
    const validLimit = Math.max(1, limit);
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

    return {
      data,
      total,
      page: validPage,
      limit: validLimit,
      totalPages,
    };
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

    return this.prisma.customer.create({
      data: createCustomerInput,
    });
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

    return this.prisma.customer.update({
      where: { id },
      data: updateCustomerInput,
    });
  }

  async delete(id: string) {
    await this.findOne(id);
    await this.prisma.customer.delete({
      where: { id },
    });
    return true;
  }
}
