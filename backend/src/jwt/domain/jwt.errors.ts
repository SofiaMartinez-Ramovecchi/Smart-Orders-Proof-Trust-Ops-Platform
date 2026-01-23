export class InvalidJwtError extends Error {
  constructor() {
    super('Invalid JWT');
  }
}

