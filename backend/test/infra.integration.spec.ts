import request from 'supertest';
import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';

describe('Auth via Gateway', () => {
  it('routes login request to auth service', async () => {
    await request('http://localhost:3000')
      .post('/auth/login')
      .send({
        wallet: 'test-wallet',
        message: 'challenge',
        signature: 'invalid-sig',
      })
      .expect(401);
  });

  it('adds request id header', async () => {
    const res = await request('http://localhost:3000')
      .post('/auth/login')
      .send({
        wallet: 'test-wallet',
        message: 'challenge',
        signature: 'invalid-sig',
      });

    expect(res.headers).toHaveProperty('x-request-id');
  });

});


