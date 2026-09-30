import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';

@InputType({ description: 'Input data untuk masuk (login) pengguna' })
export class LoginInput {
  @Field({ description: 'Alamat email pengguna' })
  @IsEmail({}, { message: 'Alamat email tidak valid' })
  email: string;

  @Field({ description: 'Kata sandi pengguna' })
  @MinLength(6, { message: 'Kata sandi minimal harus 6 karakter' })
  password: string;
}
