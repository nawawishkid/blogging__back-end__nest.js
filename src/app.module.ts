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

const envFilePath = ['.env'];

if (process.env.NODE_ENV === 'test') {
  envFilePath.unshift('.env.test');
}

@Module({
  imports: [
    ConfigModule.forRoot({
      load: [configuration],
      envFilePath,
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
        synchronize: true,
      }),
    }),
    UsersModule,
    SessionsModule,
    AuthModule,
    BlogsModule,
    FilesModule,
    CustomFieldsModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
