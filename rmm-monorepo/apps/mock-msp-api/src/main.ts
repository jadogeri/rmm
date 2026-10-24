import 'reflect-metadata';
import { NestFactory } from '@nestjs/core';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const swagger = new DocumentBuilder()
    .setTitle('RMM Mock MSP Manager API')
    .setDescription('SQLite-backed OData-compatible fixture API for the RMM service desk.')
    .setVersion('1.0.0')
    .addApiKey({ type: 'apiKey', in: 'header', name: 'X-API-Key' }, 'msp-api-key')
    .build();
  SwaggerModule.setup('docs', app, SwaggerModule.createDocument(app, swagger));
  const port = Number.parseInt(process.env.MOCK_API_PORT || '3002', 10) || 3002;
  await app.listen(port, '0.0.0.0');
  console.log('Mock MSP API listening on port ' + port + ' (docs: /docs)');
}

void bootstrap();
