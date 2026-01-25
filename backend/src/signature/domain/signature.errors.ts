export class InvalidSignatureError extends Error {
  constructor() {
    super('Invalid cryptographic signature');
  }
}

export class InvalidMessageError extends Error {
  constructor() {
    super('Signed message is invalid or was tampered');
  }
}

