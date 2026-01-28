import { Inject } from '@nestjs/common';

import type { SignatureService as SignatureServicePort } from '@/signature/domain';
import type { ChallengeService as ChallengeServicePort } from '@/challenge/domain';
import type { JwtService as JwtServicePort } from '@/jwt/domain';
import { SignedJwt } from '@/jwt/domain';
import { VerifySignatureInput } from '@/signature/domain';
import { SIGNATURE_SERVICE } from '@/signature/domain';
import { CHALLENGE_SERVICE } from '@/challenge/domain';
import { JWT_SERVICE } from '@/jwt/domain';

export class LoginService {
  constructor(
    @Inject(SIGNATURE_SERVICE)
    private readonly signatureService: SignatureServicePort,

    @Inject(CHALLENGE_SERVICE)
    private readonly challengeService: ChallengeServicePort,

    @Inject(JWT_SERVICE)
    private readonly jwtService: JwtServicePort,
  ) { }
  async login(input: VerifySignatureInput): Promise<SignedJwt> {
    const verified = await this.signatureService.verify(input);

    if (!verified.valid) {
      throw new Error('Invalid signature');
    }

    await this.challengeService.consume(input.message);

    return this.jwtService.sign({
      wallet: verified.signer,
    });
  }
}
