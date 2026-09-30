import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { AuthService } from './auth.service';
import { PrismaService } from '../prisma/prisma.service';

describe('AuthService', () => {
  let service: AuthService;
  let prismaService: any;
  let jwtService: any;

  const mockUser = {
    id: 'user-uuid-1',
    email: 'test@example.com',
    password: '$2b$10$hashedpasswordstring',
    createdAt: new Date(),
    updatedAt: new Date(),
  };

  beforeEach(async () => {
    prismaService = {
      user: {
        findUnique: jest.fn(),
        create: jest.fn(),
      },
    };

    jwtService = {
      sign: jest.fn().mockReturnValue('mocked_jwt_token'),
      verifyAsync: jest.fn(),
    };

    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: PrismaService, useValue: prismaService },
        { provide: JwtService, useValue: jwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('register', () => {
    it('harus berhasil mendaftarkan user baru dan mengembalikan accessToken & user', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);
      prismaService.user.create.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'hash').mockImplementation(async () => '$2b$10$hashedpasswordstring');

      const result = await service.register({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(prismaService.user.findUnique).toHaveBeenCalledWith({
        where: { email: 'test@example.com' },
      });
      expect(prismaService.user.create).toHaveBeenCalled();
      expect(jwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
      expect(result).toEqual({
        accessToken: 'mocked_jwt_token',
        user: mockUser,
      });
    });

    it('harus gagal registrasi dengan ConflictException jika email sudah terdaftar', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      await expect(
        service.register({
          email: 'test@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('harus berhasil login dan mengembalikan accessToken & user jika password benar', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => true);

      const result = await service.login({
        email: 'test@example.com',
        password: 'password123',
      });

      expect(result).toEqual({
        accessToken: 'mocked_jwt_token',
        user: mockUser,
      });
    });

    it('harus gagal login dengan UnauthorizedException jika password salah', async () => {
      prismaService.user.findUnique.mockResolvedValue(mockUser);
      jest.spyOn(bcrypt, 'compare').mockImplementation(async () => false);

      await expect(
        service.login({
          email: 'test@example.com',
          password: 'wrongpassword',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('harus gagal login dengan UnauthorizedException jika user tidak ditemukan', async () => {
      prismaService.user.findUnique.mockResolvedValue(null);

      await expect(
        service.login({
          email: 'notfound@example.com',
          password: 'password123',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });
  });

  describe('validateToken', () => {
    it('harus mengembalikan valid: true dan data user jika token sah', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: mockUser.id,
        email: mockUser.email,
      });
      prismaService.user.findUnique.mockResolvedValue(mockUser);

      const result = await service.validateToken('valid_token');

      expect(result).toEqual({
        valid: true,
        user: {
          id: mockUser.id,
          email: mockUser.email,
          createdAt: mockUser.createdAt,
          updatedAt: mockUser.updatedAt,
        },
      });
    });

    it('harus mengembalikan valid: false jika user dari payload token tidak ditemukan', async () => {
      jwtService.verifyAsync.mockResolvedValue({
        sub: 'non-existent-user-id',
        email: 'ghost@example.com',
      });
      prismaService.user.findUnique.mockResolvedValue(null);

      const result = await service.validateToken('valid_token_no_user');

      expect(result).toEqual({
        valid: false,
        user: null,
      });
    });

    it('harus mengembalikan valid: false jika token invalid atau expired', async () => {
      jwtService.verifyAsync.mockRejectedValue(new Error('Token expired'));

      const result = await service.validateToken('expired_token');

      expect(result).toEqual({
        valid: false,
        user: null,
      });
    });
  });
});
