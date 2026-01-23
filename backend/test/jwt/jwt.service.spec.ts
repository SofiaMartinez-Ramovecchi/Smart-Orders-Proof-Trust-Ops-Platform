import { JwtService } from "@/jwt/domain/jwt.service";
import { SimpleJwtService } from "@/jwt/infrastructure/simple-jwt.service";
import { InvalidJwtError } from "@/jwt/domain/jwt.errors";

describe('JwtService', () => {

  let jwtService: JwtService;

  beforeEach(() => {
    jwtService = new SimpleJwtService();
  });

  it('issues a JWT for a verified wallet identity', async () => {
    const result = await jwtService.sign({
      wallet: 'TEST_PUBLIC_KEY',
    });

    expect(result.token).toBeDefined();
    expect(typeof result.token).toBe('string');
  });

  it('verifies a previously issued token', async () => {
    const signed = await jwtService.sign({
      wallet: 'TEST_PUBLIC_KEY',
    });

    const verified = await jwtService.verify(signed.token);

    expect(verified.wallet).toBe('TEST_PUBLIC_KEY');
  });

  it('throws InvalidJwtError for invalid token', async () => {
    await expect(
      jwtService.verify('INVALID_TOKEN')
    ).rejects.toThrow(InvalidJwtError);
  });

  it('rejects an expired token', async () => {
    await expect(
      jwtService.verify('jwt-expired')
    ).rejects.toThrow(InvalidJwtError);
  });


});

