import { VerifiedIdentity } from "../identity";
export interface AuthStrategy<TInput = unknown> {
  authenticate(input: TInput): Promise<VerifiedIdentity>;
}

