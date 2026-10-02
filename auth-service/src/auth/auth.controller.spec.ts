import { Test, TestingModule } from '@nestjs/testing';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';

describe('AuthController', () => {
  let controller: AuthController;
  let authService: any;

  beforeEach(async () => {
    authService = {
      validateToken: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [{ provide: AuthService, useValue: authService }],
    }).compile();

    controller = module.get<AuthController>(AuthController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });

  it('harus memanggil validateToken di AuthService', async () => {
    const mockResult = { valid: true, user: { id: 'user-1', email: 'test@example.com' } };
    authService.validateToken.mockResolvedValue(mockResult);

    const result = await controller.validateToken({ token: 'test-token' });

    expect(authService.validateToken).toHaveBeenCalledWith('test-token');
    expect(result).toEqual(mockResult);
  });
});
