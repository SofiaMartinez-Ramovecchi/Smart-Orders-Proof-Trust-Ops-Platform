import {
  VerifySignatureInput,
  SignatureService
} from "@/signature/domain";
import { JwtService, SignedJwt } from "@/jwt/domain";
import { ChallengeService } from "@/challenge/domain";
export class LoginService {

  private readonly signatureService: SignatureService;
  private readonly challengeService: ChallengeService;
  private readonly jwtService: JwtService;

  constructor(
    signatureService: SignatureService,
    challengeService: ChallengeService,
    jwtService: JwtService) {
    this.signatureService = signatureService;
    this.challengeService = challengeService;
    this.jwtService = jwtService;
  }
  async login(input: VerifySignatureInput): Promise<SignedJwt> {
    const verified = await this.signatureService.verify(input);

    if (!verified.valid) {
      throw new Error('Invalid signature');
    }

    await this.challengeService.consume(input.message);

    return this.jwtService.sign({
      wallet: verified.signer,
    });
  }
}
