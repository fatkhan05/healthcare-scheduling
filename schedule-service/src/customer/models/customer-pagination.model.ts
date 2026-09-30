import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Customer } from './customer.model';

@ObjectType({ description: 'Hasil paginasi data pelanggan' })
export class CustomerPaginationResult {
  @Field(() => [Customer], { description: 'Daftar data pelanggan pada halaman saat ini' })
  data: Customer[];

  @Field(() => Int, { description: 'Total jumlah keseluruhan data pelanggan' })
  total: number;

  @Field(() => Int, { description: 'Nomor halaman saat ini' })
  page: number;

  @Field(() => Int, { description: 'Jumlah item per halaman' })
  limit: number;

  @Field(() => Int, { description: 'Total jumlah halaman' })
  totalPages: number;
}
