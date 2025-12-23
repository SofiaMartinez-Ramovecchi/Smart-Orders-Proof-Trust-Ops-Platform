import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import {SwaggerModule, DocumentBuilder} from '@nestjs/swagger';


async function bootstrap() {

  const app = await NestFactory.create(AppModule);

  app.enableCors({
    origin: 'http://localhost:1234',
    methods: 'GET,POST,PUT,DELETE',
    credentials: true,
  });

  
  const config = new DocumentBuilder() 
    .setTitle( 'API - Gateway ' )
    .setDescription( 'Documentacion de la API' )
    .setVersion( '1.0' )
    .addBearerAuth()
    .build()

  const document = SwaggerModule.createDocument( app , config )
  SwaggerModule.setup( 'docs' , app , document )
  await app.listen(process.env.PORT ?? 3000); 

} 
bootstrap();
