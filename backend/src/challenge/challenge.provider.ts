// backend/src/challenge/challenge.provider.ts
import { CHALLENGE_SERVICE } from '@/challenge/domain';
import { InMemoryChallengeService } from './infrastructure/inMemory.challenge.service';

export const ChallengeProvider = {
  provide: CHALLENGE_SERVICE,
  useClass: InMemoryChallengeService,
};

