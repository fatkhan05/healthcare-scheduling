import { InputType, Field } from '@nestjs/graphql';
import { IsEmail, MinLength } from 'class-validator';

@InputType({ description: 'Input data untuk pendaftaran pengguna baru' })
export class RegisterInput {
  @Field({ description: 'Alamat email pengguna yang valid' })
  @IsEmail({}, { message: 'Alamat email tidak valid' })
  email: string;

  @Field({ description: 'Kata sandi pengguna (minimal 6 karakter)' })
  @MinLength(6, { message: 'Kata sandi minimal harus 6 karakter' })
  password: string;
}
