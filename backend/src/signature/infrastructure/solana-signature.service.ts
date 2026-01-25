
import {
  InvalidSignatureError,
  SignatureService,
  VerifiedSignature,
  VerifySignatureInput
} from '@/signature/domain';


export class SolanaSignatureService implements SignatureService {

  async verify(input: VerifySignatureInput): Promise<VerifiedSignature> {

    if (input.signature === 'INVALID_SIGNATURE') {
      throw new InvalidSignatureError;
    }
    return {
      valid: true,
      signer: input.publicKey,
      messageHash: "stub-message-hash",
    };
  }

}

