import { LoginService } from '@/auth/domain';

describe('LoginService (unit)', () => {
  let signatureService: any;
  let challengeService: any;
  let jwtService: any;
  let loginService: LoginService;

  beforeEach(() => {
    signatureService = {
      verify: jest.fn(),
    };

    challengeService = {
      consume: jest.fn(),
    };

    jwtService = {
      sign: jest.fn(),
    };

    loginService = new LoginService(
      signatureService,
      challengeService,
      jwtService,
    );
  });

  it('throws if signature is invalid', async () => {
    signatureService.verify.mockResolvedValue({ valid: false });

    await expect(
      loginService.login({
        message: 'challenge',
        publicKey: 'wallet',
        signature: 'bad',
      }),
    ).rejects.toThrow('Invalid signature');

    expect(challengeService.consume).not.toHaveBeenCalled();
    expect(jwtService.sign).not.toHaveBeenCalled();
  });

  it('consumes challenge and issues JWT when signature is valid', async () => {
    signatureService.verify.mockResolvedValue({
      valid: true,
      signer: 'wallet-123',
    });

    jwtService.sign.mockReturnValue('jwt-token');

    const result = await loginService.login({
      message: 'challenge',
      publicKey: 'wallet-123',
      signature: 'good',
    });

    expect(challengeService.consume).toHaveBeenCalledWith('challenge');
    expect(jwtService.sign).toHaveBeenCalledWith({
      wallet: 'wallet-123',
    });

    expect(result).toBe('jwt-token');
  });

  it('does not issue JWT if challenge consumption fails', async () => {
    signatureService.verify.mockResolvedValue({
      valid: true,
      signer: 'wallet-123',
    });

    challengeService.consume.mockRejectedValue(
      new Error('Challenge already used'),
    );

    await expect(
      loginService.login({
        message: 'challenge',
        publicKey: 'wallet-123',
        signature: 'good',
      }),
    ).rejects.toThrow('Challenge already used');

    expect(jwtService.sign).not.toHaveBeenCalled();
  });
});

