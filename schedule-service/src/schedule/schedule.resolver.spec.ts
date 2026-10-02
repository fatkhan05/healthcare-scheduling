import { Test, TestingModule } from '@nestjs/testing';
import { ScheduleResolver } from './schedule.resolver';
import { ScheduleService } from './schedule.service';
import { CustomerService } from '../customer/customer.service';
import { DoctorService } from '../doctor/doctor.service';

describe('ScheduleResolver', () => {
  let resolver: ScheduleResolver;
  let scheduleService: any;
  let customerService: any;
  let doctorService: any;

  beforeEach(async () => {
    scheduleService = {
      findAll: jest.fn(),
      findOne: jest.fn(),
      create: jest.fn(),
      delete: jest.fn(),
    };
    customerService = {
      findOne: jest.fn(),
    };
    doctorService = {
      findOne: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        ScheduleResolver,
        { provide: ScheduleService, useValue: scheduleService },
        { provide: CustomerService, useValue: customerService },
        { provide: DoctorService, useValue: doctorService },
      ],
    }).compile();

    resolver = module.get<ScheduleResolver>(ScheduleResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('harus memanggil schedules', async () => {
    scheduleService.findAll.mockResolvedValue({ data: [], total: 0 });
    await resolver.schedules(1, 10);
    expect(scheduleService.findAll).toHaveBeenCalledWith(1, 10, undefined);
  });

  it('harus memanggil schedule', async () => {
    scheduleService.findOne.mockResolvedValue({ id: '1' });
    await resolver.schedule('1');
    expect(scheduleService.findOne).toHaveBeenCalledWith('1');
  });

  it('harus memanggil createSchedule', async () => {
    const input = { objective: 'A', customerId: 'c1', doctorId: 'd1', scheduledAt: new Date() };
    scheduleService.create.mockResolvedValue({ id: '1', ...input });
    await resolver.createSchedule(input);
    expect(scheduleService.create).toHaveBeenCalledWith(input);
  });

  it('harus memanggil deleteSchedule', async () => {
    scheduleService.delete.mockResolvedValue(true);
    await resolver.deleteSchedule('1');
    expect(scheduleService.delete).toHaveBeenCalledWith('1');
  });

  it('harus resolve field customer', async () => {
    customerService.findOne.mockResolvedValue({ id: 'c1', name: 'Cust' });
    const res = await resolver.customer({ customerId: 'c1' } as any);
    expect(customerService.findOne).toHaveBeenCalledWith('c1');
    expect(res).toEqual({ id: 'c1', name: 'Cust' });
  });

  it('harus resolve field doctor', async () => {
    doctorService.findOne.mockResolvedValue({ id: 'd1', name: 'Doc' });
    const res = await resolver.doctor({ doctorId: 'd1' } as any);
    expect(doctorService.findOne).toHaveBeenCalledWith('d1');
    expect(res).toEqual({ id: 'd1', name: 'Doc' });
  });
});
