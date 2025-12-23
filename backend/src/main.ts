import { NestFactory } from '@nestjs/core';
import { SolanaModule } from './solana/solana.module'

async function bootstrap() {

  const app = await NestFactory.create(SolanaModule);

  app.enableCors({
    origin: 'http://localhost:1234',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  
  await app.listen(process.env.PORT ?? 3000); 

} 
bootstrap();
