import { InputType, Field, PartialType } from '@nestjs/graphql';
import { CreateCustomerInput } from './create-customer.input';

@InputType({ description: 'Input data untuk memperbarui pelanggan' })
export class UpdateCustomerInput extends PartialType(CreateCustomerInput) {
  @Field({ nullable: true, description: 'Nama lengkap pelanggan' })
  name?: string;

  @Field({ nullable: true, description: 'Alamat email pelanggan' })
  email?: string;
}
