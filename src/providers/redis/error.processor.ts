/* eslint-disable @typescript-eslint/no-unused-vars */
import { InjectQueue, OnQueueFailed, Process, Processor } from '@nestjs/bull';

import { Job, Queue } from 'bull';

import { CqrsQueueProcessors } from '../../enums';
import { ErrorBusService, QueueRegistryService } from '../../services';

import { RedisAbstractQueueProcessor } from './abstract.processor';

@Processor(CqrsQueueProcessors.ERROR_QUEUE)
export class RedisErrorQueueProcessor extends RedisAbstractQueueProcessor {
  constructor(
    @InjectQueue(CqrsQueueProcessors.ERROR_QUEUE)
    queue: Queue,
    queueRegistryService: QueueRegistryService,
    errorBusService: ErrorBusService,
  ) {
    super(
      CqrsQueueProcessors.ERROR_QUEUE,
      queue,
      queueRegistryService,
      errorBusService,
    );
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    super.onError(job, error);
  }

  @Process(CqrsQueueProcessors.ERROR_QUEUE)
  process(job: Job<any>) {
    super.process(job);
  }
}
