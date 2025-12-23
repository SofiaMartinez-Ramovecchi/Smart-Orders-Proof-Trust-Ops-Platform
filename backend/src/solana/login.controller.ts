import { Controller, Get, Post, Body, Param } from '@nestjs/common';
import { Connection, PublicKey } from '@solana/web3.js';
import nacl from 'tweetnacl';

@Controller('login')

export class LoginController {

    constructor(){}
    
    @Post('verify')
    verifySignature(
        @Body() body: { publicKey: string; signature: number[]; message: string }
    ) {
    const { publicKey, signature, message } = body;

    const pubKeyBytes = new PublicKey(publicKey).toBytes();
    const messageBytes = new TextEncoder().encode(message);
    const signatureBytes = Uint8Array.from(signature);

    const isValid = nacl.sign.detached.verify(
        messageBytes,
        signatureBytes,
        pubKeyBytes
    );

    return {
        publicKey,
        message,
        validSignature: isValid,
    };
    }
}