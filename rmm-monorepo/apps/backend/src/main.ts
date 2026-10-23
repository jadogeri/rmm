import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { SwaggerModule } from '@nestjs/swagger';
import { swaggerConfig } from './configs/swagger.config';

class Program {
  static async bootstrap() {
    const app = await NestFactory.create(AppModule);

    // 2. Generate document and setup Swagger UI
    const config = swaggerConfig();
    const document = SwaggerModule.createDocument(app, config);
    SwaggerModule.setup('api', app, document); // Accessible at http://localhost:3001/api

    await app.listen(process.env.NEST_API_PORT ?? 3001);
  }
}

// CHANGED: Formatted promise callback exactly as requested
Program.bootstrap()
  .then(() => {
    console.log(
      `Application started successfully on port ${process.env.NEST_API_PORT ?? 3001}`,
    );
  })
  .catch((err) => console.error('Error starting application:', err));
