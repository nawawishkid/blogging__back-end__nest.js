import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);
  const configService: ConfigService = app.get(ConfigService);

  app.useGlobalPipes(
    /**
     * 'validateCustomeDecorators' option is not cited in the doc.
     * I have to read the code directly :(
     *
     * @see node_modules/@nestjs/common/pipes/validation.pipe.js
     *
     * Just opened an issue about this issue:
     * @see https://github.com/nestjs/docs.nestjs.com/issues/1566
     */
    new ValidationPipe({ transform: true, validateCustomDecorators: true }),
  );

  await app.listen(configService.get('port'));
}
bootstrap();
