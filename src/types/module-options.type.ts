import * as Redis from 'ioredis';

import { SQSClientConfig } from '@aws-sdk/client-sqs';

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
    sqs: {
      client: SQSClientConfig;
      commandQueueUrl: string;
      eventQueueUrl: string;
      errorQueueUrl: string;
      waitTimeSeconds?: number;
    };
  };
}
