import 'dotenv/config';
import * as cookieParser from 'cookie-parser';
import { NestFactory } from "@nestjs/core";

import { AppModule } from './app.module';
import { ValidationPipe } from './services/pipes/validation.pipe';
import { corsConfig } from './configs/cors.config';


async function bootstrap() {

  const PORT = process.env.PORT || 5500;

  const app = await NestFactory.create(AppModule);

  app.use(cookieParser());
  
  app.enableCors(corsConfig());
  
  app.useGlobalPipes(new ValidationPipe());

  await app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
}
bootstrap();
