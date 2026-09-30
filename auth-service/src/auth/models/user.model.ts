import { ObjectType, Field, ID } from '@nestjs/graphql';

@ObjectType({ description: 'Model data pengguna' })
export class User {
  @Field(() => ID, { description: 'ID unik pengguna' })
  id: string;

  @Field({ description: 'Alamat email pengguna' })
  email: string;

  @Field({ description: 'Waktu pembuatan akun' })
  createdAt: Date;

  @Field({ description: 'Waktu pembaruan akun terakhir' })
  updatedAt: Date;
}
