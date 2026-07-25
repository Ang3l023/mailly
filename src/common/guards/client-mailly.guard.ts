import {
  CanActivate,
  ExecutionContext,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { Request } from 'express';
import { ClientsService } from '../../clients/clients.service';

@Injectable()
export class ClientMaillyGuard implements CanActivate {
  constructor(private readonly clientsService: ClientsService) {}

  async canActivate(context: ExecutionContext): Promise<boolean> {
    const request = context.switchToHttp().getRequest<Request>();

    const apiKey = request.headers['x-api-key'] as string;

    if (!apiKey || Array.isArray(apiKey)) {
      throw new UnauthorizedException('API key is missing or invalid');
    }

    const client = await this.clientsService.findByApiKey(apiKey);

    if (!client) {
      throw new UnauthorizedException('Invalid API key');
    }

    request.client = client;

    return true;
  }
}
