import { Injectable } from '@nestjs/common';
import { ConfigurationRepository } from './repositories/configuration.repository';
import {
  CorsDatabaseConfig,
  CorsMethod,
} from './interfaces/cors-config.interface';

@Injectable()
export class ConfigurationService {
  constructor(
    private readonly configurationRepository: ConfigurationRepository,
  ) {}

  async getCorsConfig(): Promise<CorsDatabaseConfig> {
    const [originsConfig, methodsConfig, headersConfig] = await Promise.all([
      this.configurationRepository.getOrigins(),
      this.configurationRepository.getMethods(),
      this.configurationRepository.getMethods(),
    ]);

    const origins: string[] = originsConfig?.value
      ? originsConfig.value.split(',').map((origin: string) => origin.trim())
      : [];

    const validMethods: CorsMethod[] = [
      'GET',
      'HEAD',
      'PUT',
      'PATCH',
      'POST',
      'DELETE',
      'OPTIONS',
    ];
    const parsedMethods: string[] = methodsConfig?.value
      ? methodsConfig.value
          .split(',')
          .map((method: string) => method.trim().toUpperCase())
      : [];

    const methods: CorsMethod[] = parsedMethods.filter(
      (method: string): method is CorsMethod =>
        validMethods.includes(method as CorsMethod),
    );

    return {
      origins,
      methods: methods.length > 0 ? methods : ['GET', 'POST'],
      headers: headersConfig?.value
        ? headersConfig.value
            .split(',')
            .map((header: string) => header.trim().toUpperCase())
        : ['*'],
    };
  }
}
