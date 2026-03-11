import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap(): Promise<void> {
  const app = await NestFactory.create(AppModule);

  const allowedOrigins = [
    'http://localhost:5173',
    'http://localhost:3001',
  ];

  if (process.env.CORS_ORIGINS) {
    allowedOrigins.push(
      ...process.env.CORS_ORIGINS.split(',').map((o) => o.trim()),
    );
  }

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  });

  const port = process.env.PORT || 3001;
  await app.listen(port);

  console.log(`PhishGuard Backend running on port ${port}`);
}

bootstrap();
