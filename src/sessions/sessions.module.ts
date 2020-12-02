import { DynamicModule, Module } from '@nestjs/common';
import { SessionOptions } from 'express-session';
import { SessionsService } from './sessions.service';
import { SessionsController } from './sessions.controller';
import { SessionsStore } from './sessions.store';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Session } from './entities/session.entity';
import { AuthModule } from '../auth/auth.module';

const getSessionOptionsProvider = (
  options: SessionOptions = {} as SessionOptions,
) => ({
  provide: `SESSION_OPTIONS`,
  useFactory: (
    sessionsStore: SessionsStore,
    configService: ConfigService,
  ): SessionOptions => ({
    store: sessionsStore,
    ...configService.get<SessionOptions>('session'),
    ...options,
  }),
  inject: [SessionsStore, ConfigService],
});

const sessionOptionsProvider = getSessionOptionsProvider();

@Module({
  imports: [TypeOrmModule.forFeature([Session]), ConfigModule, AuthModule],
  providers: [SessionsService, SessionsStore, sessionOptionsProvider],
  controllers: [SessionsController],
  exports: [SessionsService, SessionsStore, sessionOptionsProvider],
})
export class SessionsModule {
  static forRoot(options: SessionOptions): DynamicModule {
    return {
      module: SessionsModule,
      exports: [getSessionOptionsProvider(options)],
    };
  }
}
