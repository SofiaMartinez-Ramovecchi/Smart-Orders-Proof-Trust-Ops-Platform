import { LoginService } from '@/auth/domain';
import { SolanaSignatureService } from '@/signature/infrastructure/solana-signature.service';
import { InMemoryChallengeService } from '@/challenge/infrastructure/inMemory.challenge.service';
import { SimpleJwtService } from '@/jwt/infrastructure/simple-jwt.service';

describe('LoginService – integration', () => {
  let loginService: LoginService;
  let challengeService: InMemoryChallengeService;

  beforeEach(() => {
    const signatureService = new SolanaSignatureService();
    challengeService = new InMemoryChallengeService();
    const jwtService = new SimpleJwtService();

    loginService = new LoginService(
      signatureService,
      challengeService,
      jwtService
    );
  });

  it('logs in successfully with valid signature and challenge', async () => {
    // arrange
    const challenge = await challengeService.create();

    const input = {
      message: challenge.value,
      publicKey: 'TEST_PUBLIC_KEY',
      signature: 'VALID_SIGNATURE',
    };

    // act
    const jwt = await loginService.login(input);

    // assert
    expect(jwt).toBeDefined();
    expect(jwt.token).toBeDefined();
  });

  it('rejects login with invalid signature', async () => {
    const challenge = await challengeService.create();

    const input = {
      message: challenge.value,
      publicKey: 'TEST_PUBLIC_KEY',
      signature: 'INVALID_SIGNATURE',
    };

    await expect(loginService.login(input))
      .rejects
      .toThrow();
  });

  it('rejects reused challenge (replay attack)', async () => {
    const challenge = await challengeService.create();

    const input = {
      message: challenge.value,
      publicKey: 'TEST_PUBLIC_KEY',
      signature: 'VALID_SIGNATURE',
    };

    await loginService.login(input);

    await expect(loginService.login(input))
      .rejects
      .toThrow();
  });
});

