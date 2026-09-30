import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Model data pelanggan (customer)' })
export class Customer {
  @Field(() => ID, { description: 'ID unik pelanggan' })
  id: string;

  @Field({ description: 'Nama lengkap pelanggan' })
  name: string;

  @Field({ description: 'Alamat email pelanggan' })
  email: string;

  @Field({ description: 'Waktu pendaftaran data pelanggan' })
  createdAt: Date;

  @Field({ description: 'Waktu pembaruan data pelanggan terakhir' })
  updatedAt: Date;
}
