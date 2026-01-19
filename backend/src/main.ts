import { NestFactory } from '@nestjs/core';
import { LoginModule } from './solana/login.module'

async function bootstrap() {

  const app = await NestFactory.create(LoginModule);

  app.enableCors({
  origin: [
    'http://localhost:5173',
    'https://smart-orders-proof-trust-ops-platfo.vercel.app/',
  ],
  credentials: true,
});

  
  await app.listen(process.env.PORT ?? 3000); 

} 
bootstrap();
