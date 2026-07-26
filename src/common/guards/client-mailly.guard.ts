import { CanActivate, ExecutionContext, Injectable } from '@nestjs/common';
import { Request } from 'express';
import { requestContext } from '../context/request-context';
import { UnauthorizedException } from '../../exceptions/unauthorized.exception';
import { ClientsService } from '../../modules/clients/clients.service';

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

    const currentContext = requestContext.getStore();
    if (currentContext) {
      currentContext.clientId = client.id;
    }

    request.client = client;

    return true;
  }
}
