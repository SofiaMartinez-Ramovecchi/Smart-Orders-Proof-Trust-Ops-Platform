import { Inject } from "@nestjs/common";

import { AuthStrategy } from "@/auth/core/strategy";
import { VerifySignatureInput } from "@/signature/domain";
import { VerifiedIdentity } from "@/auth/core/identity";
import { InvalidSignatureError } from "@/signature/domain";

import type { SignatureService as SignatureServicePort } from "@/signature/domain";
import type { ChallengeService as ChallengeServicePort } from "@/challenge/domain"
import { SIGNATURE_SERVICE } from "@/signature/domain";
import { CHALLENGE_SERVICE } from "@/challenge/domain";

export class PhantomAuthStrategy
  implements AuthStrategy<VerifySignatureInput> {

  constructor(
    @Inject(SIGNATURE_SERVICE)
    private readonly signatureService: SignatureServicePort,

    @Inject(CHALLENGE_SERVICE)
    private readonly challengeService: ChallengeServicePort,
  ) { }

  async authenticate(
    input: VerifySignatureInput,
  ): Promise<VerifiedIdentity> {
    const verified = await this.signatureService.verify(input);

    if (!verified.valid) {
      throw new InvalidSignatureError();
    }

    await this.challengeService.consume(input.message);

    return {
      identityType: 'WALLET',
      provider: 'PHANTOM',
      subject: verified.signer,
    };
  }
}

