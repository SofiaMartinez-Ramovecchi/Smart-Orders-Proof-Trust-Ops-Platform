import { Body, Controller, Post, HttpCode, UnauthorizedException } from '@nestjs/common';
import { LoginService } from '@/auth/domain';
import { LoginDto } from '@/auth/http/login.dto';
import { Public } from '../public.decorator';


@Controller('auth')
export class AuthController {
  constructor(private readonly loginService: LoginService) { }

  @Post('login')
  @Public()
  @HttpCode(200)
  async login(@Body() dto: LoginDto) {
    try {
      const jwt = await this.loginService.login(dto);

      return {
        token: jwt.token,
        tokenType: 'Bearer',
        _links: {
          me: { href: '/identity/me', method: 'GET' },
          orders: { href: '/orders', method: 'GET' },
        },
      };
    } catch (error) {
      throw new UnauthorizedException({
        error: 'INVALID_SIGNATURE',
        message: 'Signature verification failed',
        _links: {
          challenge: { href: '/auth/challenge', method: 'GET' },
        },
      });
    }
  }
}

