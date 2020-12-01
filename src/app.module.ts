import * as chalk from 'chalk';
import * as winston from 'winston';
import { WinstonModule } from 'nest-winston';
import { Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { UsersModule } from './users/users.module';
import { TypeOrmModule } from '@nestjs/typeorm';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { SessionsModule } from './sessions/sessions.module';
import configuration from './config/configuration';
import { AuthModule } from './auth/auth.module';
import { BlogsModule } from './blogs/blogs.module';
import { FilesModule } from './files/files.module';
import { CustomFieldsModule } from './custom-fields/custom-fields.module';
import { CustomFieldValuesModule } from './custom-field-values/custom-field-values.module';

const envFilePath = ['.env'];
const transports: winston.transport[] = [
  new winston.transports.Console({
    format: winston.format.combine(
      winston.format(info => {
        info.namespace = chalk.yellow(info.namespace);
        info.requestId = chalk.green(info.requestId);
        info.timestamp = chalk.magenta(info.timestamp);

        if (info.level === 'debug') {
          info.level = chalk.magentaBright(info.level);
          info.message = chalk.magentaBright(info.message);
        } else {
          const color = winston.config.npm.colors[info.level];

          if (typeof color === 'string' && typeof chalk[color] === 'function') {
            info.level = chalk[color](info.level);
            info.message = chalk[color](info.message);
          }
        }

        return info;
      })(),
      winston.format.printf(
        ({ message, level, timestamp, namespace, json, requestId }) => {
          let obj: any = '';

          if (json) {
            /**
             * Prevent stringifying native JS Error object to empty object literal
             */
            if (json instanceof Error) {
              obj = ' ' + json.stack;
            } else {
              obj = ' ' + JSON.stringify(json, null, 2);
            }
          }

          return `${namespace} ${
            requestId ? requestId + ' ' : ''
          }${level} ${timestamp} ${message}${obj}`;
        },
      ),
    ),
  }),
];

if (process.env.NODE_ENV === 'test') {
  envFilePath.unshift('.env.test');
}

if (process.env.NODE_ENV === 'production') {
  transports.push(
    new winston.transports.File({
      filename: 'error.log',
      level: 'error',
    }),
  );
}

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration(process.env as any)],
      envFilePath,
    }),
    WinstonModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        level: configService.get<string>('logging.level'),
        format: winston.format.combine(
          winston.format.timestamp(),
          winston.format.prettyPrint(),
        ),
        transports,
      }),
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      inject: [ConfigService],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get<string>('database.host'),
        port: configService.get<number>('database.port'),
        username: configService.get<string>('database.username'),
        password: configService.get<string>('database.password'),
        database: configService.get<string>('database.name'),
        autoLoadEntities: true,
        synchronize: process.env.NODE_ENV !== 'production',
      }),
    }),
    UsersModule,
    SessionsModule,
    AuthModule,
    BlogsModule,
    FilesModule,
    CustomFieldsModule,
    CustomFieldValuesModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
