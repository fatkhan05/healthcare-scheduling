import { Args, ID, Int, Mutation, Query, Resolver } from '@nestjs/graphql';
import { CustomerService } from './customer.service';
import { Customer } from './models/customer.model';
import { CustomerPaginationResult } from './models/customer-pagination.model';
import { CreateCustomerInput } from './dto/create-customer.input';
import { UpdateCustomerInput } from './dto/update-customer.input';

@Resolver(() => Customer)
export class CustomerResolver {
  constructor(private readonly customerService: CustomerService) {}

  @Query(() => CustomerPaginationResult, { description: 'Mendapatkan daftar pelanggan dengan paginasi' })
  async customers(
    @Args('page', { type: () => Int, defaultValue: 1 }) page: number,
    @Args('limit', { type: () => Int, defaultValue: 10 }) limit: number,
  ): Promise<CustomerPaginationResult> {
    return this.customerService.findAll(page, limit);
  }

  @Query(() => Customer, { description: 'Mendapatkan detail pelanggan berdasarkan ID' })
  async customer(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<Customer> {
    return this.customerService.findOne(id);
  }

  @Mutation(() => Customer, { description: 'Membuat data pelanggan baru' })
  async createCustomer(
    @Args('input') input: CreateCustomerInput,
  ): Promise<Customer> {
    return this.customerService.create(input);
  }

  @Mutation(() => Customer, { description: 'Memperbarui data pelanggan' })
  async updateCustomer(
    @Args('id', { type: () => ID }) id: string,
    @Args('input') input: UpdateCustomerInput,
  ): Promise<Customer> {
    return this.customerService.update(id, input);
  }

  @Mutation(() => Boolean, { description: 'Menghapus data pelanggan' })
  async deleteCustomer(
    @Args('id', { type: () => ID }) id: string,
  ): Promise<boolean> {
    return this.customerService.delete(id);
  }
}
