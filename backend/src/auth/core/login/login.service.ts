import { Inject } from '@nestjs/common';
import type { JwtService as JwtServicePort } from '@/jwt/domain';
import { JWT_SERVICE, SignedJwt } from '@/jwt/domain';
import { VerifiedIdentity } from '../identity';
export class LoginService {
  constructor(
    @Inject(JWT_SERVICE)
    private readonly jwtService: JwtServicePort,
  ) { }

  async login(identity: VerifiedIdentity): Promise<SignedJwt> {
    return await this.jwtService.sign({
      sub: identity.subject,
      provider: identity.provider,
    });
  }
}

