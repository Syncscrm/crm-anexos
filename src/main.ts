import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import * as express from 'express';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  const uploadPath = join(__dirname, '..', '..', 'uploads');
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
    console.log(`Created directory: ${uploadPath}`);
  } else {
    console.log(`Directory already exists: ${uploadPath}`);
  }

  // Servir arquivos estáticos
  app.use('/uploads', express.static(uploadPath));

  app.enableCors();
  await app.listen(3002);
  console.log('Server is listening on port 3002');
}
bootstrap();
