import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Doctor } from './doctor.model';

@ObjectType({ description: 'Hasil paginasi data dokter' })
export class DoctorPaginationResult {
  @Field(() => [Doctor], { description: 'Daftar data dokter pada halaman saat ini' })
  data: Doctor[];

  @Field(() => Int, { description: 'Total jumlah keseluruhan data dokter' })
  total: number;

  @Field(() => Int, { description: 'Nomor halaman saat ini' })
  page: number;

  @Field(() => Int, { description: 'Jumlah item per halaman' })
  limit: number;

  @Field(() => Int, { description: 'Total jumlah halaman' })
  totalPages: number;
}
