import { ChallengeService, InvalidChallengeError } from "@/challenge/domain";
import { InMemoryChallengeService } from "@/challenge/infrastructure/inMemory.challenge.service";

describe('ChallengeService', () => {

  let challengeService: ChallengeService;
  beforeEach(() => {
    challengeService = new InMemoryChallengeService();
  });
  it('creates a unique login challenge', async () => {
    const challenge = await challengeService.create();

    expect(challenge.value).toBeDefined();
    expect(typeof challenge.value).toBe('string');
    expect(challenge.expiresAt).toBeInstanceOf(Date);
  });

  it('rejects reused challenge', async () => {
    const challenge = await challengeService.create();

    await challengeService.consume(challenge.value);

    await expect(
      challengeService.consume(challenge.value)
    ).rejects.toThrow(InvalidChallengeError);
  });

  it('rejects unknown challenge', async () => {
    await expect(
      challengeService.consume('UNKNOWN_CHALLENGE')
    ).rejects.toThrow(InvalidChallengeError);
  });

  it('rejects expired challenge', async () => {
    const challenge = await challengeService.create();

    jest
      .spyOn(Date, 'now')
      .mockReturnValue(challenge.expiresAt.getTime() + 1);

    await expect(
      challengeService.consume(challenge.value)
    ).rejects.toThrow(InvalidChallengeError);
  });


});

