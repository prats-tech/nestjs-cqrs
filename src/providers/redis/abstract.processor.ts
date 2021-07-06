import { Job, Queue } from 'bull';

import { AbstractMessage } from '../../types';
import { CqrsQueueProcessors } from '../../enums';
import { AbstractBusService, QueueRegistryService } from '../../services';

export class RedisAbstractQueueProcessor {
  constructor(
    private readonly queueProcessor: CqrsQueueProcessors,
    private readonly queue: Queue,
    private readonly queueRegistryService: QueueRegistryService,
    private readonly abstractBusService: AbstractBusService<AbstractMessage>,
  ) {
    this.abstractBusService.observable().subscribe({
      next: this.onMessageDispatch.bind(this),
    });
  }

  onError(job: Job<any>, error: any) {
    console.log('error', error, job.data);
  }

  process(job: Job<any>) {
    this.queueRegistryService.handle(this.queueProcessor, job.data);
  }

  async onMessageDispatch(message: any) {
    await this.queue.add(this.queueProcessor, message);
  }
}
