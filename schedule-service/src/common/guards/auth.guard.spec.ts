import { Test, TestingModule } from '@nestjs/testing';
import { UnauthorizedException } from '@nestjs/common';
import { HttpService } from '@nestjs/axios';
import { ConfigService } from '@nestjs/config';
import { of, throwError } from 'rxjs';
import { AuthGuard } from './auth.guard';

describe('AuthGuard', () => {
  let guard: AuthGuard;
  let httpService: any;
  let configService: any;

  beforeEach(async () => {
    httpService = {
      post: jest.fn(),
    };

    configService = {
      get: jest.fn().mockReturnValue('http://auth-service:3001'),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthGuard,
        { provide: HttpService, useValue: httpService },
        { provide: ConfigService, useValue: configService },
      ],
    }).compile();

    guard = module.get<AuthGuard>(AuthGuard);
  });

  it('should be defined', () => {
    expect(guard).toBeDefined();
  });

  it('harus melempar UnauthorizedException jika header authorization tidak ada', async () => {
    const context: any = {
      switchToHttp: () => ({
        getRequest: () => ({ headers: {} }),
      }),
    };

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('No token provided'),
    );
  });

  it('harus mengizinkan akses dan attach user ke request jika token valid', async () => {
    const mockUser = { id: 'user-1', email: 'test@example.com' };
    const mockReq: any = {
      headers: { authorization: 'Bearer valid_token' },
    };

    const context: any = {
      switchToHttp: () => ({
        getRequest: () => mockReq,
      }),
    };

    httpService.post.mockReturnValue(of({ data: { valid: true, user: mockUser } }));

    const result = await guard.canActivate(context);

    expect(result).toBe(true);
    expect(mockReq.user).toEqual(mockUser);
    expect(httpService.post).toHaveBeenCalledWith(
      'http://auth-service:3001/internal/validate-token',
      { token: 'valid_token' },
    );
  });

  it('harus melempar UnauthorizedException jika valid: false dari auth-service', async () => {
    const mockReq: any = {
      headers: { authorization: 'Bearer invalid_token' },
    };

    const context: any = {
      switchToHttp: () => ({
        getRequest: () => mockReq,
      }),
    };

    httpService.post.mockReturnValue(of({ data: { valid: false, user: null } }));

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired token'),
    );
  });

  it('harus melempar UnauthorizedException jika HTTP request ke auth-service gagal', async () => {
    const mockReq: any = {
      headers: { authorization: 'Bearer token' },
    };

    const context: any = {
      switchToHttp: () => ({
        getRequest: () => mockReq,
      }),
    };

    httpService.post.mockReturnValue(throwError(() => new Error('Network error')));

    await expect(guard.canActivate(context)).rejects.toThrow(
      new UnauthorizedException('Invalid or expired token'),
    );
  });
});
