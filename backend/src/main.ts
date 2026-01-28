import { NestFactory } from '@nestjs/core';
import { AuthModule } from './auth/auth.module';

async function bootstrap() {

  const app = await NestFactory.create(AuthModule);

  app.enableCors({
    origin: [
      'http://localhost:5173',
      'https://smart-orders-proof-trust-ops-platfo.vercel.app/',
    ],
    credentials: true,
  });

  const port = process.env.PORT ?? 4000;
  await app.listen(port);

}
bootstrap();
