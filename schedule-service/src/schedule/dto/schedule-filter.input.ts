import { InputType, Field, ID } from '@nestjs/graphql';
import { IsDate, IsOptional, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

@InputType({ description: 'Filter pencarian data jadwal' })
export class ScheduleFilterInput {
  @Field(() => ID, { nullable: true, description: 'Filter berdasarkan ID dokter' })
  @IsOptional()
  @IsUUID()
  doctorId?: string;

  @Field(() => ID, { nullable: true, description: 'Filter berdasarkan ID pelanggan' })
  @IsOptional()
  @IsUUID()
  customerId?: string;

  @Field({ nullable: true, description: 'Filter dari tanggal (dateFrom)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateFrom?: Date;

  @Field({ nullable: true, description: 'Filter sampai tanggal (dateTo)' })
  @IsOptional()
  @Type(() => Date)
  @IsDate()
  dateTo?: Date;
}
