import { Challenge } from "@/challenge/domain";

export interface ChallengeService {
  create(): Promise<Challenge>;
  consume(challenge: string): Promise<void>;
}

