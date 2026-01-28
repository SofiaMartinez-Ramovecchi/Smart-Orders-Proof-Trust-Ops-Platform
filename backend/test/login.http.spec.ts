import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

import { AuthController } from '@/auth/http/auth.controller';
import { LoginService } from '@/auth/domain';

import { SIGNATURE_SERVICE } from '@/signature/domain';
import { CHALLENGE_SERVICE } from '@/challenge/domain';
import { JWT_SERVICE } from '@/jwt/domain';

describe('Auth HTTP — Login', () => {
  let app: INestApplication;

  let signatureServiceMock: {
    verify: jest.Mock;
  };

  let challengeServiceMock: {
    consume: jest.Mock;
  };

  let jwtServiceMock: {
    sign: jest.Mock;
  };

  beforeAll(async () => {
    signatureServiceMock = {
      verify: jest.fn(),
    };

    challengeServiceMock = {
      consume: jest.fn(),
    };

    jwtServiceMock = {
      sign: jest.fn(),
    };

    const moduleRef = await Test.createTestingModule({
      controllers: [AuthController],
      providers: [
        LoginService,
        {
          provide: SIGNATURE_SERVICE,
          useValue: signatureServiceMock,
        },
        {
          provide: CHALLENGE_SERVICE,
          useValue: challengeServiceMock,
        },
        {
          provide: JWT_SERVICE,
          useValue: jwtServiceMock,
        },
      ],
    }).compile();

    app = moduleRef.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  it('POST /auth/login returns JWT and HATEOAS links', async () => {

    signatureServiceMock.verify.mockResolvedValueOnce({
      valid: true,
      signer: 'TEST_WALLET',
      messageHash: 'hash',
    });

    jwtServiceMock.sign.mockReturnValueOnce({ token: 'jwt-token' });


    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        wallet: 'test-wallet',
        message: 'test-challenge',
        signature: 'valid-signature',
      })
      .expect(200);

    expect(response.body).toEqual({
      token: expect.any(String),
      tokenType: 'Bearer',
      _links: {
        me: {
          href: '/identity/me',
          method: 'GET',
        },
        orders: {
          href: '/orders',
          method: 'GET',
        },
      },
    });
  });



  it('POST /auth/login returns 401 for invalid signature', async () => {
    signatureServiceMock.verify.mockResolvedValueOnce({
      valid: false,
    });

    const response = await request(app.getHttpServer())
      .post('/auth/login')
      .send({
        wallet: 'test-wallet',
        message: 'test-challenge',
        signature: 'invalid-signature',
      })
      .expect(401);

    expect(response.body).toEqual({
      error: 'INVALID_SIGNATURE',
      message: 'Signature verification failed',
      _links: {
        challenge: {
          href: '/auth/challenge',
          method: 'GET',
        },
      },
    });
  });

});

