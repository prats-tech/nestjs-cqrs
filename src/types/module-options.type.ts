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
      // if this is 0 means short polling
      longPollWaitTimeSeconds: number;
      // timeout for receive checking for messages
      receiveMessagesWaitTimeSeconds: number;
      // if is true, the receive time is random
      randomizeReceiveTimes?: boolean;
    };
  };
}
