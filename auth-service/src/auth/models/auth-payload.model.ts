import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType({ description: 'Response payload autentikasi yang berisi access token dan data user' })
export class AuthPayload {
  @Field({ description: 'Token JWT untuk akses endpoint terproteksi' })
  accessToken: string;

  @Field(() => User, { description: 'Data profil pengguna' })
  user: User;
}
