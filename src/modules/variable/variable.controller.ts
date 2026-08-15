import { Controller } from '@nestjs/common';
import { VariableService } from './variable.service';

@Controller('variable')
export class VariableController {
  constructor(private readonly variableService: VariableService) {}
}
