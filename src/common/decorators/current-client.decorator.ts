/* eslint-disable @typescript-eslint/no-unsafe-return */
import {
  createParamDecorator,
  ExecutionContext,
  BadRequestException,
} from '@nestjs/common';
import { Request } from 'express';
import { Client } from '../../database/entities/client.entity';

export const CurrentClient = createParamDecorator(
  (propertyPath: string | undefined, ctx: ExecutionContext) => {
    const request: Request = ctx.switchToHttp().getRequest();

    if (!request.client) {
      throw new BadRequestException('Client not found in request');
    }

    // Si no se pasa ninguna propiedad, devolvemos todo el objeto client
    if (!propertyPath) {
      return request.client;
    }

    // Buscamos dentro de request.client
    const value = getNestedProperty(request.client, propertyPath);

    if (value === undefined) {
      throw new BadRequestException(
        `Property "${propertyPath}" not found in client object`,
      );
    }

    return value;
  },
);

type ClientPropertyPath = Omit<
  Client,
  'logs' | 'sentMails' | 'createdAt' | 'updatedAt' | 'deletedAt'
>;

/** Helper para propiedades anidadas */
function getNestedProperty(
  obj: ClientPropertyPath,
  path: string,
): number | string | boolean | undefined | object {
  if (!obj) return undefined;

  return path.split('.').reduce((current, key) => {
    return current && current[key] !== undefined ? current[key] : undefined;
  }, obj);
}
