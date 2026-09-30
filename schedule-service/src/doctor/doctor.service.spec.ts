import { Test, TestingModule } from '@nestjs/testing';
import { NotFoundException } from '@nestjs/common';
import { DoctorService } from './doctor.service';
import { PrismaService } from '../prisma/prisma.service';

describe('DoctorService', () => {
  let service: DoctorService;
  let prismaService: any;

  const mockDoctor = {
    id: 'doc-uuid-1',
    name: 'dr. Andi Wijaya',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = {
      doctor: {
        findMany: jest.fn(),
        count: jest.fn(),
        findUnique: jest.fn(),
        create: jest.fn(),
        update: jest.fn(),
        delete: jest.fn(),
      },
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorService,
        { provide: PrismaService, useValue: prismaService },
      ],
    }).compile();

    service = module.get<DoctorService>(DoctorService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('findAll', () => {
    it('harus mengembalikan daftar dokter dengan data paginasi', async () => {
      prismaService.doctor.findMany.mockResolvedValue([mockDoctor]);
      prismaService.doctor.count.mockResolvedValue(1);

      const result = await service.findAll(1, 10);

      expect(prismaService.doctor.findMany).toHaveBeenCalledWith({
        skip: 0,
        take: 10,
        orderBy: { createdAt: 'desc' },
      });
      expect(result).toEqual({
        data: [mockDoctor],
        total: 1,
        page: 1,
        limit: 10,
        totalPages: 1,
      });
    });
  });

  describe('findOne', () => {
    it('harus mengembalikan detail dokter jika ditemukan', async () => {
      prismaService.doctor.findUnique.mockResolvedValue(mockDoctor);

      const result = await service.findOne('doc-uuid-1');

      expect(result).toEqual(mockDoctor);
    });

    it('harus melempar NotFoundException jika dokter tidak ditemukan', async () => {
      prismaService.doctor.findUnique.mockResolvedValue(null);

      await expect(service.findOne('invalid-id')).rejects.toThrow(NotFoundException);
    });
  });

  describe('create', () => {
    it('harus berhasil membuat dokter baru', async () => {
      prismaService.doctor.create.mockResolvedValue(mockDoctor);

      const input = { name: 'dr. Andi Wijaya' };
      const result = await service.create(input);

      expect(prismaService.doctor.create).toHaveBeenCalledWith({ data: input });
      expect(result).toEqual(mockDoctor);
    });
  });

  describe('update', () => {
    it('harus berhasil memperbarui dokter', async () => {
      prismaService.doctor.findUnique.mockResolvedValue(mockDoctor);
      prismaService.doctor.update.mockResolvedValue({ ...mockDoctor, name: 'dr. Andi Wijaya Sp.PD' });

      const result = await service.update('doc-uuid-1', { name: 'dr. Andi Wijaya Sp.PD' });

      expect(result.name).toBe('dr. Andi Wijaya Sp.PD');
    });
  });

  describe('delete', () => {
    it('harus berhasil menghapus dokter', async () => {
      prismaService.doctor.findUnique.mockResolvedValue(mockDoctor);
      prismaService.doctor.delete.mockResolvedValue(mockDoctor);

      const result = await service.delete('doc-uuid-1');

      expect(result).toBe(true);
      expect(prismaService.doctor.delete).toHaveBeenCalledWith({ where: { id: 'doc-uuid-1' } });
    });
  });
});
