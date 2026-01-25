import { SolanaSignatureService } from '@/signature/infrastructure/solana-signature.service';
import { SignatureService, InvalidSignatureError } from '@/signature/domain';
describe('SignatureService', () => {
  let service: SignatureService;

  beforeEach(() => {
    service = new SolanaSignatureService();
  });

  it('verifies a valid wallet signature', async () => {
    const message = 'login-challenge';
    const publicKey = 'TEST_PUBLIC_KEY';
    const signature = 'VALID_SIGNATURE';

    const result = await service.verify({
      message,
      publicKey,
      signature,
    });

    expect(result.signer).toBe(publicKey);
    expect(result.messageHash).toBeDefined();
  });


  it('throws InvalidSignatureError for an invalid signature', async () => {
    await expect(
      service.verify({
        message: 'login-challenge',
        publicKey: 'TEST_PUBLIC_KEY',
        signature: 'INVALID_SIGNATURE',
      })
    ).rejects.toThrow(InvalidSignatureError);
  });


});

