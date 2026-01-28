// backend/src/auth/auth.module.ts
import { Module } from '@nestjs/common';

import { AuthController } from './http/auth.controller';
import { LoginService } from './domain/login.service';

import { SignatureProvider } from '@/signature/signature.provider';
import { ChallengeProvider } from '@/challenge/challenge.provider';
import { JwtProvider } from '@/jwt/jwt.provider';

@Module({
  controllers: [AuthController],
  providers: [
    LoginService,
    SignatureProvider,
    ChallengeProvider,
    JwtProvider,
  ],
})
export class AuthModule { }

