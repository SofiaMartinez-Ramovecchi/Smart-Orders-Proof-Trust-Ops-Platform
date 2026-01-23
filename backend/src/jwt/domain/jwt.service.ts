
import { SignJwtInput, SignedJwt, VerifiedJwt } from "@/jwt/domain";

export interface JwtService {
  sign(input: SignJwtInput): Promise<SignedJwt>;
  verify(token: string): Promise<VerifiedJwt>;
}

