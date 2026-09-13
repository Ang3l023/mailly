export type CorsMethod =
  'GET' | 'HEAD' | 'PUT' | 'PATCH' | 'POST' | 'DELETE' | 'OPTIONS';

export interface CorsDatabaseConfig {
  origins: string[];
  methods: CorsMethod[];
  headers: string[];
}
