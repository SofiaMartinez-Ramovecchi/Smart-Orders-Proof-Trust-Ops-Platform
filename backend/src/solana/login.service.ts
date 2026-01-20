export class LoginService {

  constructor(
    private readonly signatureService: {
      verify(payload: any): boolean
    },
    private readonly jwtService: {
      sign(payload: any): string
    },
  ) { }

  login(payload: {
    wallet: string
    challenge: string
    signature: string
  }): string {
    const isValid = this.signatureService.verify(payload)

    if (!isValid) {
      throw new Error('Invalid signature')
    }

    return this.jwtService.sign({ wallet: payload.wallet })
  }

}
