import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Model data dokter' })
export class Doctor {
  @Field(() => ID, { description: 'ID unik dokter' })
  id: string;

  @Field({ description: 'Nama lengkap dokter' })
  name: string;

  @Field({ description: 'Waktu pembuatan data dokter' })
  createdAt: Date;

  @Field({ description: 'Waktu pembaruan data dokter terakhir' })
  updatedAt: Date;
}
