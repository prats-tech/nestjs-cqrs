/* eslint-disable @typescript-eslint/no-unused-vars */
import { InjectQueue, OnQueueFailed, Process, Processor } from '@nestjs/bull';

import { Job, Queue } from 'bull';

import { CqrsQueueProcessors } from '../../enums';
import { EventBusService, QueueRegistryService } from '../../services';

@Processor(CqrsQueueProcessors.EVENT_QUEUE)
export class EventQueueProcessor {
  constructor(
    @InjectQueue(CqrsQueueProcessors.EVENT_QUEUE)
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

  @Process(CqrsQueueProcessors.EVENT_QUEUE)
  process(job: Job<any>) {
    this.queueRegistryService.handle(CqrsQueueProcessors.EVENT_QUEUE, job.data);
  }

  async onMessageDispatch(message: any) {
    await this.queue.add(CqrsQueueProcessors.EVENT_QUEUE, message);
  }
}
