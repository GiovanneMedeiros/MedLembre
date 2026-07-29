import { Logger, ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import helmet from 'helmet';
import { AppModule } from './app.module';

const logger = new Logger('Bootstrap');

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule, { rawBody: true });

  // Necessário atrás do proxy da Railway/Vercel para que req.ip reflita o
  // IP real do cliente (X-Forwarded-For) — sem isso, o rate limiting trata
  // todas as requisições como vindas do IP do proxy.
  app.set('trust proxy', 1);

  app.use(helmet());

  const allowedOrigins = (process.env.WEB_ORIGIN ?? 'http://localhost:5173')
    .split(',')
    .map((origin) => origin.trim());

  app.enableCors({
    origin: allowedOrigins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
    }),
  );

  const port = process.env.PORT ?? 3333;
  await app.listen(port);
  logger.log(`HTTP server ouvindo na porta ${port}`);
}
bootstrap().catch((error) => {
  logger.error('Falha ao inicializar a aplicação:', error);
  process.exit(1);
});
