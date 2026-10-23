import { DocumentBuilder } from '@nestjs/swagger';

export const swaggerConfig = () => {
  // 1. Build the Swagger configuration options
  return new DocumentBuilder()
    .setTitle('My API Title')
    .setDescription('Detailed description of my application API')
    .setVersion('1.0')
    .addBearerAuth()
    .build();
};
