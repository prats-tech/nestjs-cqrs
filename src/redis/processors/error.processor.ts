/* eslint-disable @typescript-eslint/no-unused-vars */
import { InjectQueue, OnQueueFailed, Process, Processor } from '@nestjs/bull';

import { Job, Queue } from 'bull';

import { CqrsQueueProcessors } from '../../enums';
import { EventBusService, QueueRegistryService } from '../../services';

@Processor(CqrsQueueProcessors.ERROR_QUEUE)
export class ErrorQueueProcessor {
  constructor(
    @InjectQueue(CqrsQueueProcessors.ERROR_QUEUE)
    private readonly queue: Queue,
    private readonly queueRegistryService: QueueRegistryService,
    private readonly eventBus: EventBusService,
  ) {
    this.eventBus.observable().subscribe({
      next: this.onMessageDispatch.bind(this),
    });
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    console.log('error', error, job.data);
  }

  @Process(CqrsQueueProcessors.ERROR_QUEUE)
  process(job: Job<any>) {
    this.queueRegistryService.handle(CqrsQueueProcessors.ERROR_QUEUE, job.data);
  }

  async onMessageDispatch(message: any) {
    await this.queue.add(CqrsQueueProcessors.ERROR_QUEUE, message);
  }
}
