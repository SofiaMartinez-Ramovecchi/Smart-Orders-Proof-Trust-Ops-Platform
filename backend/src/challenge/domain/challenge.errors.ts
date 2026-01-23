export class InvalidChallengeError extends Error {
  constructor() {
    super('Invalid or expired challenge');
  }
}

