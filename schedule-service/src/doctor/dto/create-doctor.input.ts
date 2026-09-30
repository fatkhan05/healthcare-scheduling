import { InputType, Field } from '@nestjs/graphql';
import { IsNotEmpty, IsString } from 'class-validator';

@InputType({ description: 'Input data untuk membuat dokter baru' })
export class CreateDoctorInput {
  @Field({ description: 'Nama lengkap dokter' })
  @IsString()
  @IsNotEmpty({ message: 'Nama dokter tidak boleh kosong' })
  name: string;
}
