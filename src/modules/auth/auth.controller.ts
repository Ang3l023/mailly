import { Body, Controller, Post, UseGuards } from '@nestjs/common';
import { AuthService } from './auth.service';
import { SignInDto } from './dto/sign-in.dto';
import { CreateUserDto } from './dto/create-user.dto';
import { Public } from '../../common/decorators/is-public.decorator';
import { ERole } from '../../common/enums/users/roles.enum';
import { ForgotPasswordDto } from './dto/forgot-password.dto';
import { VerifyResetCodeDto } from './dto/verify-reset-code.dto';
import { ResetPasswordDto } from './dto/reset-password.dto';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

@Public()
@Controller('auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('sign-in')
  async signIn(@Body() signInDto: SignInDto) {
    return await this.authService.signIn(signInDto);
  }

  @Post('sign-up')
  async signUp(@Body() signUpDto: CreateUserDto) {
    return await this.authService.signUp({ ...signUpDto, role: ERole.USER });
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 1, ttl: 10000 } })
  @Post('forgot-password')
  forgot(@Body() dto: ForgotPasswordDto) {
    return this.authService.forgotPassword(dto);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 1, ttl: 10000 } })
  @Post('verify-reset-code')
  verify(@Body() dto: VerifyResetCodeDto) {
    return this.authService.verifyCode(dto.email, dto.code);
  }

  @UseGuards(ThrottlerGuard)
  @Throttle({ short: { limit: 1, ttl: 10000 } })
  @Post('reset-password')
  reset(@Body() dto: ResetPasswordDto) {
    return this.authService.resetPassword(dto.email, dto.code, dto.newPassword);
  }
}
