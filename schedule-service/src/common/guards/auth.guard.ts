import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { GqlExecutionContext } from '@nestjs/graphql';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { firstValueFrom } from 'rxjs';

@Injectable()
export class AuthGuard implements CanActivate {
  constructor(
    private readonly httpService: HttpService,
    private readonly configService: ConfigService,
  ) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    let req = context.switchToHttp().getRequest();
    if (!req) {
      const gqlCtx = GqlExecutionContext.create(context);
      req = gqlCtx.getContext().req;
    }

    const authHeader = req?.headers?.authorization;
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      throw new UnauthorizedException('No token provided');
    }

    const token = authHeader.split(' ')[1];
    const authServiceUrl = this.configService.get<string>(
      'AUTH_SERVICE_URL',
      'http://auth-service:3001',
    );

    try {
      const response = await firstValueFrom(
        this.httpService.post(`${authServiceUrl}/internal/validate-token`, {
          token,
        }),
      );

      if (!response.data || response.data.valid !== true) {
        throw new UnauthorizedException('Invalid or expired token');
      }

      req.user = response.data.user;
      return true;
    } catch (error) {
      if (error instanceof UnauthorizedException) {
        throw error;
      }
      throw new UnauthorizedException('Invalid or expired token');
    }
  }
}
