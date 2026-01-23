import {
  VerifySignatureInput,
  VerifiedSignature
} from '@/signature/domain';

export interface SignatureService {
  verify(input: VerifySignatureInput): Promise<VerifiedSignature>;
}

