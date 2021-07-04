import * as Redis from 'ioredis';

export class CqrsModuleAsyncOptions {
  commands?: boolean;
  events?: boolean;
  errors?: boolean;
}

export class CqrsModuleOptions {
  service: 'redis' | 'aws';
  async?: boolean | CqrsModuleAsyncOptions;
  redis?: string | Redis.RedisOptions;
  aws?: {
    region: string;
    accessKey: string;
    secretKey: string;
    endpoint: string;
    commandQueue: string;
    eventQueue: string;
    errorQueue: string;
  };
}
