import { Challenge, ChallengeService, InvalidChallengeError } from '@/challenge/domain';
export class InMemoryChallengeService implements ChallengeService {

  private readonly used = new Set<string>();
  private readonly issued = new Set<string>();
  private readonly expirations = new Map<string, Date>();
  async create(): Promise<Challenge> {
    const value = "LOGIN_CHALLENGE";
    const expiresAt = new Date(Date.now() + 5 * 60 * 1000);
    this.issued.add(value);
    this.expirations.set(value, expiresAt)
    return {
      value,
      expiresAt,
    }
  }
  async consume(challenge: string): Promise<void> {
    const expiresAt = this.expirations.get(challenge);
    if (this.used.has(challenge)) {
      throw new InvalidChallengeError();
    }
    if (!this.issued.has(challenge)) {
      throw new InvalidChallengeError();
    }
    if (!expiresAt || Date.now() > expiresAt.getTime()) {
      throw new InvalidChallengeError();
    }
    this.used.add(challenge);
  }

}
