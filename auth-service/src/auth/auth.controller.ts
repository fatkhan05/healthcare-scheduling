import { Body, Controller, HttpCode, HttpStatus, Post } from '@nestjs/common';
import { AuthService } from './auth.service';
import { ValidateTokenDto } from './dto/validate-token.dto';

@Controller('internal')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('validate-token')
  @HttpCode(HttpStatus.OK)
  async validateToken(@Body() validateTokenDto: ValidateTokenDto) {
    return this.authService.validateToken(validateTokenDto.token);
  }
}
