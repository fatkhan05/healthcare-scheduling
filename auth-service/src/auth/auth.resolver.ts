import { Args, Mutation, Query, Resolver } from '@nestjs/graphql';
import { AuthService } from './auth.service';
import { AuthPayload } from './models/auth-payload.model';
import { ValidateTokenPayload } from './models/validate-token-payload.model';
import { RegisterInput } from './dto/register.input';
import { LoginInput } from './dto/login.input';

@Resolver()
export class AuthResolver {
  constructor(private readonly authService: AuthService) {}

  @Mutation(() => AuthPayload, { description: 'Mendaftarkan pengguna baru' })
  async register(
    @Args('input') input: RegisterInput,
  ): Promise<AuthPayload> {
    return this.authService.register(input);
  }

  @Mutation(() => AuthPayload, { description: 'Masuk (login) pengguna' })
  async login(
    @Args('input') input: LoginInput,
  ): Promise<AuthPayload> {
    return this.authService.login(input);
  }

  @Query(() => ValidateTokenPayload, { description: 'Memvalidasi keabsahan token JWT' })
  async validateToken(
    @Args('token', { description: 'Token JWT yang akan divalidasi' }) token: string,
  ): Promise<ValidateTokenPayload> {
    return this.authService.validateToken(token);
  }
}
