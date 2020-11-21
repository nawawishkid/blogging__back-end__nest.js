import { ConfigService } from '@nestjs/config';
import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { bootstrap } from './bootstrap';

(async () => {
  await bootstrap(await NestFactory.create(AppModule)).then(app => {
    const configService: ConfigService = app.get(ConfigService);

    app.listen(configService.get('port'));

    return app;
  });
})();
