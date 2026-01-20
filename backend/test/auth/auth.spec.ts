import { describe, expect, test } from '@jest/globals';
import { LoginService } from '../../src/solana/login.service';

describe('Login', () => {
  it('accepts a valid signature', () => {
    const signatureService = {
      verify: jest.fn().mockReturnValue(true),
    }

    const jwtService = {
      sign: jest.fn().mockReturnValue('jwt-token'),
    }

    const login = new LoginService(signatureService as any, jwtService as any)

    const result = login.login({
      wallet: 'wallet',
      challenge: 'challenge',
      signature: 'valid',
    });

    expect(result).toBe('jwt-token')
  })

  it('rejects an invalid signature', () => {
    const signatureService = {
      verify: jest.fn().mockReturnValue(false),
    }

    const jwtService = {
      sign: jest.fn(),
    }

    const login = new LoginService(signatureService as any, jwtService as any)

    expect(() =>
      login.login({
        wallet: 'wallet',
        challenge: 'challenge',
        signature: 'invalid',
      }),
    ).toThrow()
  })

  it('issues JWT only after successful verification', () => {
    const signatureService = {
      verify: jest.fn().mockReturnValue(true),
    }

    const jwtService = {
      sign: jest.fn().mockReturnValue('jwt'),
    }

    const login = new LoginService(signatureService as any, jwtService as any)

    login.login({
      wallet: 'wallet',
      challenge: 'challenge',
      signature: 'valid',
    })

    expect(jwtService.sign).toHaveBeenCalledWith({ wallet: 'wallet' })
  })
})

