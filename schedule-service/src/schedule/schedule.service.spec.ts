import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, NotFoundException } from '@nestjs/common';
import { CACHE_MANAGER } from '@nestjs/cache-manager';
import { getQueueToken } from '@nestjs/bull';
import { ScheduleService } from './schedule.service';
import { PrismaService } from '../prisma/prisma.service';

describe('ScheduleService', () => {
  let service: ScheduleService;
  let prismaService: any;
  let cacheManager: any;
  let notificationQueue: any;

  const mockCustomer = {
    id: 'cust-uuid-1',
    name: 'Budi Santoso',
    email: 'budi@example.com',
  };

  const mockDoctor = {
    id: 'doc-uuid-1',
    name: 'dr. Andi Wijaya',
  };

  const mockSchedule = {
    id: 'sched-uuid-1',
    objective: 'Konsultasi Rutin',
    customerId: 'cust-uuid-1',
    doctorId: 'doc-uuid-1',
    scheduledAt: new Date('2026-10-10T10:00:00.000Z'),
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = {
      schedule: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        findFirst: jest.fn(),
        create: jest.fn(),
        delete: jest.fn(),
      },
      customer: {
        findUnique: jest.fn(),
      },
      doctor: {
        findUnique: jest.fn(),
      },
    };

    cacheManager = {
      get: jest.fn().mockResolvedValue(null),
      set: jest.fn().mockResolvedValue(undefined),
      reset: jest.fn().mockResolvedValue(undefined),
    };

    notificationQueue = {
      add: jest.fn().mockResolvedValue(undefined),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleService,
        { provide: PrismaService, useValue: prismaService },
        { provide: CACHE_MANAGER, useValue: cacheManager },
        { provide: getQueueToken('notification'), useValue: notificationQueue },
      ],
    }).compile();

    service = module.get<ScheduleService>(ScheduleService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('harus mengembalikan daftar jadwal dengan paginasi dan filter', async () => {
      prismaService.schedule.findMany.mockResolvedValue([mockSchedule]);
      prismaService.schedule.count.mockResolvedValue(1);

      const filter = {
        doctorId: 'doc-uuid-1',
        customerId: 'cust-uuid-1',
        dateFrom: new Date('2026-10-01'),
        dateTo: new Date('2026-10-31'),
      };

      const result = await service.findAll(1, 10, filter);

      expect(prismaService.schedule.findMany).toHaveBeenCalled();
      expect(result).toEqual({
        data: [mockSchedule],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });

    it('harus mengembalikan data dari cache jika tersedia', async () => {
      const cachedResult = { data: [mockSchedule], total: 1, page: 1, limit: 10, totalPages: 1 };
      cacheManager.get.mockResolvedValue(cachedResult);

      const result = await service.findAll(1, 10);

      expect(result).toEqual(cachedResult);
      expect(prismaService.schedule.findMany).not.toHaveBeenCalled();
    });
  });

  describe('findOne', () => {
    it('harus mengembalikan detail jadwal jika ditemukan', async () => {
      prismaService.schedule.findUnique.mockResolvedValue(mockSchedule);

      const result = await service.findOne('sched-uuid-1');

      expect(result).toEqual(mockSchedule);
    });

    it('harus melempar NotFoundException jika jadwal tidak ditemukan', async () => {
      prismaService.schedule.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    const createInput = {
      objective: 'Konsultasi Rutin',
      customerId: 'cust-uuid-1',
      doctorId: 'doc-uuid-1',
      scheduledAt: new Date('2026-10-10T10:00:00.000Z'),
    };

    it('harus berhasil membuat jadwal baru dan enqueue email notification', async () => {
      prismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      prismaService.doctor.findUnique.mockResolvedValue(mockDoctor);
      prismaService.schedule.findFirst.mockResolvedValue(null);
      prismaService.schedule.create.mockResolvedValue(mockSchedule);

      const result = await service.create(createInput);

      expect(prismaService.customer.findUnique).toHaveBeenCalledWith({ where: { id: createInput.customerId } });
      expect(prismaService.doctor.findUnique).toHaveBeenCalledWith({ where: { id: createInput.doctorId } });
      expect(prismaService.schedule.findFirst).toHaveBeenCalledWith({
        where: { doctorId: createInput.doctorId, scheduledAt: createInput.scheduledAt },
      });
      expect(notificationQueue.add).toHaveBeenCalledWith('send-schedule-email', expect.anything());
      expect(result).toEqual(mockSchedule);
    });

    it('harus melempar NotFoundException jika customer tidak ditemukan', async () => {
      prismaService.customer.findUnique.mockResolvedValue(null);

      await expect(service.create(createInput)).rejects.toThrow(new NotFoundException('Customer not found'));
    });

    it('harus melempar NotFoundException jika doctor tidak ditemukan', async () => {
      prismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      prismaService.doctor.findUnique.mockResolvedValue(null);

      await expect(service.create(createInput)).rejects.toThrow(new NotFoundException('Doctor not found'));
    });

    it('harus melempar ConflictException jika jadwal dokter bentrok pada waktu yang sama', async () => {
      prismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      prismaService.doctor.findUnique.mockResolvedValue(mockDoctor);
      prismaService.schedule.findFirst.mockResolvedValue(mockSchedule);

      await expect(service.create(createInput)).rejects.toThrow(
        new ConflictException('Doctor already has a schedule at this time'),
      );
    });
  });

  describe('delete', () => {
    it('harus berhasil menghapus jadwal dan enqueue cancellation email', async () => {
      prismaService.schedule.findUnique.mockResolvedValue(mockSchedule);
      prismaService.customer.findUnique.mockResolvedValue(mockCustomer);
      prismaService.doctor.findUnique.mockResolvedValue(mockDoctor);
      prismaService.schedule.delete.mockResolvedValue(mockSchedule);

      const result = await service.delete('sched-uuid-1');

      expect(result).toBe(true);
      expect(prismaService.schedule.delete).toHaveBeenCalledWith({ where: { id: 'sched-uuid-1' } });
      expect(notificationQueue.add).toHaveBeenCalledWith('send-schedule-email', expect.anything());
    });
  });
});
