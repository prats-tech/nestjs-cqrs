import { Injectable } from '@nestjs/common';

import { Observable } from 'rxjs';

import { CqrsQueueProcessors } from '../enums';
import { QueueRegistry } from '../static';
import { AbstractMessage } from '../types';

@Injectable()
export class QueueRegistryService {
  dispatch(queueProcessor: CqrsQueueProcessors, message: AbstractMessage) {
    QueueRegistry.getInstance().dispatch(queueProcessor, message);
  }

  getProcessorObservable(
    queueProcessor: CqrsQueueProcessors,
  ): Observable<AbstractMessage> {
    return QueueRegistry.getInstance().getProcessorObservable(queueProcessor);
  }

  handle(queueProcessor: CqrsQueueProcessors, message: AbstractMessage) {
    QueueRegistry.getInstance().handle(queueProcessor, message);
  }
}
