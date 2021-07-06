/* eslint-disable @typescript-eslint/no-unused-vars */
import { InjectQueue, OnQueueFailed, Process, Processor } from '@nestjs/bull';

import { Job, Queue } from 'bull';

import { CqrsQueueProcessors } from '../../enums';
import { EventBusService, QueueRegistryService } from '../../services';

import { RedisAbstractQueueProcessor } from './abstract.processor';

@Processor(CqrsQueueProcessors.EVENT_QUEUE)
export class RedisEventQueueProcessor extends RedisAbstractQueueProcessor {
  constructor(
    @InjectQueue(CqrsQueueProcessors.EVENT_QUEUE)
    queue: Queue,
    queueRegistryService: QueueRegistryService,
    eventBusService: EventBusService,
  ) {
    super(
      CqrsQueueProcessors.EVENT_QUEUE,
      queue,
      queueRegistryService,
      eventBusService,
    );
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    super.onError(job, error);
  }

  @Process(CqrsQueueProcessors.EVENT_QUEUE)
  process(job: Job<any>) {
    super.process(job);
  }
}
