import { ObjectType, Field } from '@nestjs/graphql';
import { User } from './user.model';

@ObjectType({ description: 'Response payload hasil validasi token JWT' })
export class ValidateTokenPayload {
  @Field({ description: 'Status keabsahan token JWT' })
  valid: boolean;

  @Field(() => User, { nullable: true, description: 'Data user jika token valid' })
  user?: User | null;
}
