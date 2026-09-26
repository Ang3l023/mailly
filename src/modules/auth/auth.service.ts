import { Injectable, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcrypt';
import { UserService } from '../user/user.service';
import { SignInDto } from './dto/sign-in.dto';
import { IToken } from '../../common/interfaces/token.interface';
import { UnauthorizedException } from '../../exceptions/unauthorized.exception';
import { ClientsService } from '../clients/clients.service';
import { IPayloadToken } from '../../common/interfaces/payload.interface';
import { CreateUserDto } from './dto/create-user.dto';
import { ValidationException } from '../../exceptions/validation.exception';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { randomInt } from 'crypto';
import { PasswordResetTokenRepository } from './repositories/password-reset-token.repository';
import { createHash } from 'node:crypto';
import { MailsService } from '../mails/mails.service';
import { User } from '../../database/entities/user.entity';
import { PasswordResetToken } from '../../database/entities/password-reset-token.entity';
import { IsNull } from 'typeorm';

const CODE_TTL_MINUTES = 15;
const MAX_ATTEMPTS = 5;

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly clientService: ClientsService,
    private readonly jwtService: JwtService,
    private readonly passwordResetTokenRepository: PasswordResetTokenRepository,
    private readonly mailService: MailsService,
  ) {}

  async signUp(signUp: CreateUserDto): Promise<IToken> {
    const { email, password, username } = signUp;

    const [existEmail, existUsername] = await Promise.all([
      this.userService.existByEmail(email),
      this.userService.existByUsername(username),
    ]);

    if (existEmail) {
      throw new ValidationException(
        `The email ${email} already exists, please try again.`,
        'ERROR_VALID_EMAIL_REGISTERED',
      );
    }

    if (existUsername) {
      throw new ValidationException(
        `The username ${username} already exists, please try again.`,
        `ERROR_VALID_USERNAMEL_REGISTERED`,
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(password, salt);

    await this.userService.create({
      ...signUp,
      password: hashed,
    });

    return this.signIn({ email, password });
  }

  async signIn(signInDto: SignInDto): Promise<IToken> {
    const { email, password } = signInDto;

    const user = await this.userService.existByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        `The credentials provided with email "${email}" is not valid`,
        'ERROR_VALIDATIO_CREDENTIALS',
      );
    }

    const valid = await bcrypt.compare(password, user.password);

    if (!valid) {
      throw new UnauthorizedException(
        `The credentials provided with email "${email}" is not valid`,
        'ERROR_VALIDATIO_CREDENTIALS',
      );
    }

    if (!user.enabled) {
      throw new UnauthorizedException(
        `The credentials is disabled, please contact with support`,
        'DISABLED_CREDENTIALS',
      );
    }

    const payload: IPayloadToken = {
      id: user.id,
      email: user.email,
      username: user.username,
      roles: [user.role],
    };

    try {
      const client = await this.clientService.findByUserId(user.id);
      payload.clientId = client.id;
    } catch (error) {
      this.logger.error(error);
    }

    const token = await this.jwtService.signAsync(payload);

    return {
      token,
    };
  }

  private hashCode(code: string): string {
    return createHash('sha256').update(code).digest('hex');
  }

  private generateNumericCode(): string {
    return randomInt(0, 1_000_000).toString().padStart(6, '0');
  }

  async forgotPassword(forgotPasswordDto: ForgotPasswordDto): Promise<void> {
    try {
      const user = await this.userService.existByEmail(forgotPasswordDto.email);

      if (!user) return;

      await this.passwordResetTokenRepository.invalidateTokensBefore(user.id);

      const code = this.generateNumericCode();

      const codeHash = this.hashCode(code);

      const expiresAt = new Date(Date.now() + CODE_TTL_MINUTES * 60 * 1000);

      await this.passwordResetTokenRepository.create({
        user,
        codeHash,
        expiresAt,
        verified: false,
        attempts: 0,
        usedAt: null,
      });

      await this.mailService.sendMailForgotPassword({
        username: user.username,
        email: user.email,
        code,
        expiresInMinutes: CODE_TTL_MINUTES,
        year: new Date().getFullYear(),
      });
    } catch (error) {
      this.logger.error(error);
    }
  }

  async findActiveToken(user: User, code: string): Promise<PasswordResetToken> {
    const codeHash = this.hashCode(code);

    const token = await this.passwordResetTokenRepository.findOne({
      where: { codeHash, user: { id: user.id }, usedAt: IsNull() },
      relations: {
        user: true,
      },
    });

    if (!token) {
      const latest = await this.passwordResetTokenRepository.findLastToken(
        user.id,
      );

      if (latest) {
        await this.passwordResetTokenRepository.update(latest.id, {
          attempts: latest.attempts + 1,
          usedAt: latest.attempts >= MAX_ATTEMPTS ? new Date() : latest.usedAt,
        });
      }

      throw new UnauthorizedException(
        'Código invalido o expirado',
        'VERIFY_RESET_TOKEN',
      );
    }

    if (token.expiresAt < new Date()) {
      throw new UnauthorizedException('Código expirado', 'VERIFY_RESET_TOKEN');
    }

    if (token.attempts >= MAX_ATTEMPTS) {
      throw new UnauthorizedException(
        'Demasiados intentos',
        'VERIFY_RESET_TOKEN',
      );
    }

    return token;
  }

  async verifyCode(email: string, code: string): Promise<void> {
    const user = await this.userService.existByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Código invalido o expirado',
        'VERIFY_RESET_TOKEN',
      );
    }

    const token = await this.findActiveToken(user, code);

    await this.passwordResetTokenRepository.update(token.id, {
      verified: true,
    });
  }

  async resetPassword(
    email: string,
    code: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userService.existByEmail(email);

    if (!user) {
      throw new UnauthorizedException(
        'Código invalido o expirado',
        'VERIFY_RESET_TOKEN',
      );
    }

    const token = await this.findActiveToken(user, code);

    if (!token || !token.verified) {
      throw new ValidationException(
        'Primero debe verificar el token',
        'VALIDATE_VERIFIED_RESET_TOKEN',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await this.userService.updatePassword(user.id, hashed);

    await this.passwordResetTokenRepository.update(token.id, {
      updatedAt: new Date(),
    });

    await this.passwordResetTokenRepository.invalidateTokensBefore(user.id);
  }

  async changePassword(
    userId: number,
    currentPassword: string,
    newPassword: string,
  ): Promise<void> {
    const user = await this.userService.findOne(userId);

    if (!user) {
      throw new UnauthorizedException(
        'No se puedo verificar su identidad para realizar esta acción',
        'VERIFY_USER_CHANGE_PASSWORD',
      );
    }

    const valid = await bcrypt.compare(currentPassword, user.password);

    if (!valid) {
      throw new UnauthorizedException(
        'No se pudo validar correctamente la contraseña actual.',
        'VERIFY_PASSWORD_CHANGE_PASSWORD',
      );
    }

    const salt = await bcrypt.genSalt(10);
    const hashed = await bcrypt.hash(newPassword, salt);

    await this.userService.updatePassword(user.id, hashed);
  }
}
