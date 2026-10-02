import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { CustomerService } from './customer.service';
import { PrismaService } from '../prisma/prisma.service';

describe('CustomerService', () => {
  let service: CustomerService;
  let prismaService: any;
  let cacheManager: any;

  const mockCustomer = {
    id: 'cust-uuid-1',
    name: 'Budi Santoso',
    email: 'budi@example.com',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = {
      customer: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    cacheManager = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        CustomerService,
        { provide: PrismaService, useValue: prismaService },
        { provide: CACHE_MANAGER, useValue: cacheManager },
      ],
    }).compile();

    service = module.get<CustomerService>(CustomerService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('harus mengembalikan daftar pelanggan dengan data paginasi', async () => {
      prismaService.customer.findMany.mockResolvedValue([mockCustomer]);
      prismaService.customer.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(prismaService.customer.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: [mockCustomer],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('harus mengembalikan data dari cache jika tersedia', async () => {
      const cachedResult = { data: [mockCustomer], total: 1, page: 1, limit: 10, totalPages: 1 };
      cacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.findAll(1, 10);

      expect(result).toEqual(cachedResult);
      expect(prismaService.customer.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('harus mengembalikan detail pelanggan jika ditemukan', async () => {
      prismaService.customer.findUnique.mockResolvedValue(mockCustomer);

      const result = await service.findOne('cust-uuid-1');

      expect(result).toEqual(mockCustomer);
    });

    it('harus melempar NotFoundException jika pelanggan tidak ditemukan', async () => {
      prismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('harus berhasil membuat pelanggan baru', async () => {
      prismaService.customer.findUnique.mockResolvedValue(null);
      prismaService.customer.create.mockResolvedValue(mockCustomer);

      const input = { name: 'Budi Santoso', email: 'budi@example.com' };
      const result = await service.create(input);

      expect(prismaService.customer.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(mockCustomer);
    });

    it('harus melempar ConflictException jika email sudah terdaftar', async () => {
      prismaService.customer.findUnique.mockResolvedValue(mockCustomer);

      const input = { name: 'Budi Santoso', email: 'budi@example.com' };
      await expect(service.create(input)).rejects.toThrow(ConflictException);
    });
  });

  describe('update', () => {
    it('harus berhasil memperbarui pelanggan', async () => {
      prismaService.customer.findUnique
        .mockResolvedValueOnce(mockCustomer)
        .mockResolvedValueOnce(null);
      prismaService.customer.update.mockResolvedValue({ ...mockCustomer, name: 'Budi Updated' });

      const result = await service.update('cust-uuid-1', { name: 'Budi Updated' });

      expect(result.name).toBe('Budi Updated');
    });

    it('harus melempar ConflictException jika email baru milik pelanggan lain', async () => {
      const otherCustomer = { ...mockCustomer, id: 'cust-uuid-2', email: 'other@example.com' };
      prismaService.customer.findUnique
        .mockResolvedValueOnce(mockCustomer)
        .mockResolvedValueOnce(otherCustomer);

      await expect(
        service.update('cust-uuid-1', { email: 'other@example.com' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('delete', () => {
    it('harus berhasil menghapus pelanggan', async () => {
      prismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      prismaService.customer.delete.mockResolvedValue(mockCustomer);

      const result = await service.delete('cust-uuid-1');

      expect(result).toBe(true);
      expect(prismaService.customer.delete).toHaveBeenCalledWith({ where: { id: 'cust-uuid-1' } });
    });
  });
});
