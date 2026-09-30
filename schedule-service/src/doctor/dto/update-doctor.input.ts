import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateDoctorInput } from './create-doctor.input';

@InputType({ description: 'Input data untuk memperbarui dokter' })
export class UpdateDoctorInput extends PartialType(CreateDoctorInput) {
  @Field({ nullable: true, description: 'Nama lengkap dokter' })
  name?: string;
}
