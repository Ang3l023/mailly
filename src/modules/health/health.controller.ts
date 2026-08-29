import { Controller, Get } from '@nestjs/common';
import { Public } from '../../common/decorators/is-public.decorator';

@Public()
@Controller('health')
export class HealthController {
  @Get()
  health() {
    return 'Hello World!';
  }
}
