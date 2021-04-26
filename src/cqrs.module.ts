/* eslint-disable @typescript-eslint/no-unused-vars */
import { DynamicModule, Global, Module } from "@nestjs/common";
import { BullModule } from "@nestjs/bull";

import { CqrsQueueProcessors } from "./enums";

import { RedisCommandQueueProcessor, RedisEventQueueProcessor } from "./redis";

import {
  EventBusService,
  CommandBusService,
  QueueRegistryService,
} from "./services";

import { QueueRegistry } from "./static";

import { CqrsModuleOptions } from "./types";

@Global()
@Module({})
export class CqrsModule {
  static register(options: CqrsModuleOptions): DynamicModule {
    let queueImports: DynamicModule[];
    let queueProviders: any[];
    if (options.queue) {
      if (typeof options.queue === "boolean") {
        options.queue = {
          commands: options.queue,
          events: options.queue,
        };
      }
    } else {
      options.queue = {
        commands: false,
        events: false,
      };
    }
    QueueRegistry.getInstance().queueOptions = options.queue;
    if (options.redis) {
      queueImports = this.getRedisImports(options.redis);
      queueProviders = this.getRedisProviders();
    }
    const providers = [
      QueueRegistryService,
      CommandBusService,
      EventBusService,
    ];
    return {
      module: CqrsModule,
      imports: [...queueImports],
      providers: [...queueProviders, ...providers],
      exports: [...providers],
    };
  }

  static getRedisImports(
    redisOpts: string | Redis.RedisOptions
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
    ];
  }

  static getRedisProviders(): any[] {
    return [RedisCommandQueueProcessor, RedisEventQueueProcessor];
  }
}
