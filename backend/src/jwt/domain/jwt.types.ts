export type SignJwtInput = {
  sub: string,
  provider: string;
}

export type SignedJwt = {
  token: string;
}

export type VerifiedJwt = {
  wallet: string;
}

