import { Module } from '@nestjs/common';
import { APP_GUARD } from '@nestjs/core';
import { JwtModule } from '@nestjs/jwt';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { AuthService } from './auth.service';
import { AuthController } from './auth.controller';
import { UserModule } from '../user/user.module';
import { IConfigSchema } from '../../common/interfaces/config.interface';
import { AuthGuard } from '../../common/guards/auth.guard';
import { RolesGuard } from '../../common/guards/roles.guard';
import { TypeOrmModule } from '@nestjs/typeorm';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';

@Module({
  imports: [
    TypeOrmModule.forFeature([PasswordResetToken]),
    UserModule,
    JwtModule.registerAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService<IConfigSchema>) => ({
        secret: configService.get<string>('jwt.secret', { infer: true }),
        global: true,
        signOptions: {
          expiresIn: configService.get('jwt.expiresIn', {
            infer: true,
          }),
        },
      }),
      inject: [ConfigService],
    }),
  ],
  controllers: [AuthController],
  providers: [
    AuthService,
    PasswordResetTokenRepository,
    { provide: APP_GUARD, useClass: AuthGuard },
    { provide: APP_GUARD, useClass: RolesGuard },
  ],
  exports: [AuthService],
})
export class AuthModule {}
