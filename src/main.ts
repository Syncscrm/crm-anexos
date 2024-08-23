import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { join } from 'path';
import { mkdirSync, existsSync } from 'fs';
import * as express from 'express';
import * as bodyParser from 'body-parser';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  
  // Atualizando o caminho para a pasta 'uploads' fora da pasta do projeto
  const uploadPath = join(__dirname, '..', '..', '..', 'uploads');
  if (!existsSync(uploadPath)) {
    mkdirSync(uploadPath, { recursive: true });
    console.log(`Created directory: ${uploadPath}`);
  } else {
    console.log(`Directory already exists: ${uploadPath}`);
  }

  // Servir arquivos estáticos
  app.use('/uploads', express.static(uploadPath));

  // Aumentando o limite do body para 10MB
  app.use(bodyParser.json({ limit: '10mb' }));
  app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

  app.enableCors();  // Habilitar CORS padrão, se necessário
  await app.listen(3002);
  console.log('Server is listening on port 3002');
}
bootstrap();
