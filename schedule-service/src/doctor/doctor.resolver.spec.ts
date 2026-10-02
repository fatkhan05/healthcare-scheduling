import { Test, TestingModule } from '@nestjs/testing';
import { DoctorResolver } from './doctor.resolver';
import { DoctorService } from './doctor.service';

describe('DoctorResolver', () => {
  let resolver: DoctorResolver;
  let service: any;

  beforeEach(async () => {
    service = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      update: jest.fn(),
      delete: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        DoctorResolver,
        { provide: DoctorService, useValue: service },
      ],
    }).compile();

    resolver = module.get<DoctorResolver>(DoctorResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('harus memanggil doctors', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0 });
    await resolver.doctors(1, 10);
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
  });

  it('harus memanggil doctor', async () => {
    service.findOne.mockResolvedValue({ id: '1' });
    await resolver.doctor('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('harus memanggil createDoctor', async () => {
    const input = { name: 'dr. A' };
    service.create.mockResolvedValue({ id: '1', ...input });
    await resolver.createDoctor(input);
    expect(service.create).toHaveBeenCalledWith(input);
  });

  it('harus memanggil updateDoctor', async () => {
    const input = { name: 'dr. A' };
    service.update.mockResolvedValue({ id: '1' });
    await resolver.updateDoctor('1', input);
    expect(service.update).toHaveBeenCalledWith('1', input);
  });

  it('harus memanggil deleteDoctor', async () => {
    service.delete.mockResolvedValue(true);
    await resolver.deleteDoctor('1');
    expect(service.delete).toHaveBeenCalledWith('1');
  });
});
