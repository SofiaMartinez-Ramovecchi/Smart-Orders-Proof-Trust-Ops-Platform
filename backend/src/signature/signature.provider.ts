// backend/src/signature/signature.provider.ts
import { SIGNATURE_SERVICE } from '@/signature/domain';
import { SolanaSignatureService } from './infrastructure/solana-signature.service';

export const SignatureProvider = {
  provide: SIGNATURE_SERVICE,
  useClass: SolanaSignatureService,
};

