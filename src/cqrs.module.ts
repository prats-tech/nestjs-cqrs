/* eslint-disable @typescript-eslint/no-unused-vars */
import { DynamicModule, Global, Injectable, Module } from '@nestjs/common';
import { BullModule } from '@nestjs/bull';

import * as Redis from 'ioredis';

import { StaticInjectorModule } from '@prats-tech/nestjs-static-injector';

import { CqrsQueueProcessors } from './enums';
import {
  RedisCommandQueueProcessor,
  RedisEventQueueProcessor,
  RedisErrorQueueProcessor,
} from './providers/redis';
import {
  AwsSQSCommandQueueProcessor,
  AwsSQSErrorsQueueProcessor,
  AwsSQSEventQueueProcessor,
} from './providers/aws/sqs';
import {
  EventBusService,
  CommandBusService,
  ErrorBusService,
  QueueRegistryService,
  CqrsLogService,
} from './services';
import { QueueRegistry } from './static';
import { CqrsModuleOptions } from './types';

@Global()
@Module({})
export class CqrsModule {
  static register(options: CqrsModuleOptions): DynamicModule {
    let queueImports: DynamicModule[];
    let queueProviders: any[];

    if (options.async && typeof options.async === 'boolean') {
      options.async = {
        commands: options.async,
        events: options.async,
        errors: options.async,
      };
    } else {
      options.async = {
        commands: false,
        events: false,
        errors: false,
      };
    }

    QueueRegistry.getInstance().asyncOptions = options.async;

    if (options.service === 'redis' && options.redis) {
      queueImports = this.getRedisImports(options.redis);
      queueProviders = this.getRedisProviders();
    } else if (options.service === 'aws' && options.aws) {
      queueImports = [];
      queueProviders = this.getSqsProviders();
    }

    const providers = [
      QueueRegistryService,
      CommandBusService,
      EventBusService,
      ErrorBusService,
      CqrsLogService,
    ];

    const provider = {
      provide: 'CQRS-OPTIONS',
      useFactory: () => options,
    };

    return {
      module: CqrsModule,
      imports: [StaticInjectorModule, ...queueImports],
      providers: [...queueProviders, ...providers, provider],
      exports: [...providers, provider],
    };
  }

  private static getRedisImports(
    redisOpts: string | Redis.RedisOptions,
  ): DynamicModule[] {
    return [
      BullModule.registerQueue({
        name: CqrsQueueProcessors.COMMAND_QUEUE,
        redis: redisOpts,
      }),
      BullModule.registerQueue({
        name: CqrsQueueProcessors.EVENT_QUEUE,
        redis: redisOpts,
      }),
      BullModule.registerQueue({
        name: CqrsQueueProcessors.ERROR_QUEUE,
        redis: redisOpts,
      }),
    ];
  }

  private static getRedisProviders(): any[] {
    return [
      RedisCommandQueueProcessor,
      RedisEventQueueProcessor,
      RedisErrorQueueProcessor,
    ];
  }

  private static getSqsProviders(): any[] {
    return [
      AwsSQSCommandQueueProcessor,
      AwsSQSErrorsQueueProcessor,
      AwsSQSEventQueueProcessor,
    ];
  }
}
