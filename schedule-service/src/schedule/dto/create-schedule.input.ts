import { InputType, Field, ID } from '@nestjs/graphql';
import { IsDate, IsNotEmpty, IsString, IsUUID } from 'class-validator';
import { Type } from 'class-transformer';

@InputType({ description: 'Input data untuk membuat jadwal baru' })
export class CreateScheduleInput {
  @Field({ description: 'Tujuan atau deskripsi singkat konsultasi' })
  @IsString()
  @IsNotEmpty({ message: 'Tujuan konsultasi tidak boleh kosong' })
  objective: string;

  @Field(() => ID, { description: 'ID pelanggan' })
  @IsUUID(undefined, { message: 'ID pelanggan harus berupa UUID yang valid' })
  customerId: string;

  @Field(() => ID, { description: 'ID dokter' })
  @IsUUID(undefined, { message: 'ID dokter harus berupa UUID yang valid' })
  doctorId: string;

  @Field({ description: 'Waktu jadwal konsultasi' })
  @Type(() => Date)
  @IsDate({ message: 'Waktu jadwal tidak valid' })
  scheduledAt: Date;
}
