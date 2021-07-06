/* eslint-disable @typescript-eslint/no-unused-vars */
import { InjectQueue, OnQueueFailed, Process, Processor } from '@nestjs/bull';

import { Job, Queue } from 'bull';

import { CqrsQueueProcessors } from '../../enums';
import { CommandBusService, QueueRegistryService } from '../../services';

import { RedisAbstractQueueProcessor } from './abstract.processor';

@Processor(CqrsQueueProcessors.COMMAND_QUEUE)
export class RedisCommandQueueProcessor extends RedisAbstractQueueProcessor {
  constructor(
    @InjectQueue(CqrsQueueProcessors.COMMAND_QUEUE)
    queue: Queue,
    queueRegistryService: QueueRegistryService,
    commandBusService: CommandBusService,
  ) {
    super(
      CqrsQueueProcessors.COMMAND_QUEUE,
      queue,
      queueRegistryService,
      commandBusService,
    );
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    super.onError(job, error);
  }

  @Process(CqrsQueueProcessors.COMMAND_QUEUE)
  process(job: Job<any>) {
    super.process(job);
  }
}
