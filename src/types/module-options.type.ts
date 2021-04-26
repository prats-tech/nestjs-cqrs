import * as Redis from "ioredis";

export class CqrsModuleQueueOptions {
  commands?: boolean;
  events?: boolean;
}

export class CqrsModuleOptions {
  queue?: boolean | CqrsModuleQueueOptions;
  redis?: string | Redis.RedisOptions;
}
