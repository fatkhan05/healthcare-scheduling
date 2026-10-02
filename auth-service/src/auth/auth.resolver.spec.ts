import { Test, TestingModule } from '@nestjs/testing';
import { AuthResolver } from './auth.resolver';
import { AuthService } from './auth.service';

describe('AuthResolver', () => {
  let resolver: AuthResolver;
  let authService: any;

  beforeEach(async () => {
    authService = {
      register: jest.fn(),
      login: jest.fn(),
      validateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [AuthResolver, { provide: AuthService, useValue: authService }],
    }).compile();

    resolver = module.get<AuthResolver>(AuthResolver);
  });

  it('should be defined', () => {
    expect(resolver).toBeDefined();
  });

  it('harus memanggil register di AuthService', async () => {
    const input = { email: 'test@example.com', password: 'password123' };
    const mockResult = { accessToken: 'token', user: { id: '1', email: input.email } };
    authService.register.mockResolvedValue(mockResult);

    const result = await resolver.register(input);

    expect(authService.register).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockResult);
  });

  it('harus memanggil login di AuthService', async () => {
    const input = { email: 'test@example.com', password: 'password123' };
    const mockResult = { accessToken: 'token', user: { id: '1', email: input.email } };
    authService.login.mockResolvedValue(mockResult);

    const result = await resolver.login(input);

    expect(authService.login).toHaveBeenCalledWith(input);
    expect(result).toEqual(mockResult);
  });

  it('harus memanggil validateToken di AuthService', async () => {
    const mockResult = { valid: true, user: { id: '1', email: 'test@example.com' } };
    authService.validateToken.mockResolvedValue(mockResult);

    const result = await resolver.validateToken('token');

    expect(authService.validateToken).toHaveBeenCalledWith('token');
    expect(result).toEqual(mockResult);
  });
});
