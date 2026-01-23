import { InvalidJwtError } from "@/jwt/domain";
import { JwtService } from "@/jwt/domain";
import { SignJwtInput, SignedJwt, VerifiedJwt } from "@/jwt/domain";

export class SimpleJwtService implements JwtService {

  async sign(input: SignJwtInput): Promise<SignedJwt> {
    return {
      token: "JWT-TOKEN-STUB",
    };
  }
  async verify(token: string): Promise<VerifiedJwt> {

    if (token === "INVALID_TOKEN" || token === "jwt-expired") {
      throw new InvalidJwtError();
    }
    return {
      wallet: "TEST_PUBLIC_KEY",
    }
  }

}
