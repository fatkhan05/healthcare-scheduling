import { Test, TestingModule } from '@nestjs/testing';
import { CustomerResolver } from './customer.resolver';
import { CustomerService } from './customer.service';

describe('CustomerResolver', () => {
  let resolver: CustomerResolver;
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
        CustomerResolver,
        { provide: CustomerService, useValue: service },
      ],
    }).compile();

    resolver = module.get<CustomerResolver>(CustomerResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('harus memanggil customers', async () => {
    service.findAll.mockResolvedValue({ data: [], total: 0 });
    await resolver.customers(1, 10);
    expect(service.findAll).toHaveBeenCalledWith(1, 10);
  });

  it('harus memanggil customer', async () => {
    service.findOne.mockResolvedValue({ id: '1' });
    await resolver.customer('1');
    expect(service.findOne).toHaveBeenCalledWith('1');
  });

  it('harus memanggil createCustomer', async () => {
    const input = { name: 'A', email: 'a@e.com' };
    service.create.mockResolvedValue({ id: '1', ...input });
    await resolver.createCustomer(input);
    expect(service.create).toHaveBeenCalledWith(input);
  });

  it('harus memanggil updateCustomer', async () => {
    const input = { name: 'A' };
    service.update.mockResolvedValue({ id: '1' });
    await resolver.updateCustomer('1', input);
    expect(service.update).toHaveBeenCalledWith('1', input);
  });

  it('harus memanggil deleteCustomer', async () => {
    service.delete.mockResolvedValue(true);
    await resolver.deleteCustomer('1');
    expect(service.delete).toHaveBeenCalledWith('1');
  });
});
