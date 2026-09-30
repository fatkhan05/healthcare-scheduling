import { ObjectType, Field, Int } from '@nestjs/graphql';
import { Schedule } from './schedule.model';

@ObjectType({ description: 'Hasil paginasi data jadwal' })
export class SchedulePaginationResult {
  @Field(() => [Schedule], { description: 'Daftar data jadwal pada halaman saat ini' })
  data: Schedule[];

  @Field(() => Int, { description: 'Total jumlah keseluruhan data jadwal' })
  total: number;

  @Field(() => Int, { description: 'Nomor halaman saat ini' })
  page: number;

  @Field(() => Int, { description: 'Jumlah item per halaman' })
  limit: number;

  @Field(() => Int, { description: 'Total jumlah halaman' })
  totalPages: number;
}
