// src/signature/domain/signature.types.ts

export type VerifySignatureInput = {
  message: string;
  signature: string;
  publicKey: string;
};

export type VerifiedSignature = {
  valid: true;
  signer: string;
  messageHash: string;
};

