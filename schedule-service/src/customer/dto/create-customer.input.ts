import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, IsNotEmpty, IsString } from 'class-validator';

@InputType({ description: 'Input data untuk membuat pelanggan baru' })
export class CreateCustomerInput {
  @Field({ description: 'Nama lengkap pelanggan' })
  @IsString()
  @IsNotEmpty({ message: 'Nama pelanggan tidak boleh kosong' })
  name: string;

  @Field({ description: 'Alamat email pelanggan' })
  @IsEmail({}, { message: 'Alamat email tidak valid' })
  email: string;
}
