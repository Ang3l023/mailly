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

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly userService: UserService,
    private readonly clientService: ClientsService,
    private readonly jwtService: JwtService,
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
}
