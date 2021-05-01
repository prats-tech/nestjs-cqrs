import { Observable } from 'rxjs';

import { AbstractBusContract } from '../contracts';
import { CqrsQueueProcessors } from '../enums';
import { AbstractMessage } from '../types';

import { QueueRegistryService } from './queue-registry.service';

export class AbstractBusService<MessageType extends AbstractMessage>
  implements AbstractBusContract<MessageType> {
  private messages: MessageType[] = [];

  constructor(
    protected readonly queueProcessor: CqrsQueueProcessors,
    protected readonly queueRegistryService: QueueRegistryService,
  ) {}

  observable(): Observable<MessageType> {
    return this.queueRegistryService.getProcessorObservable(
      this.queueProcessor,
    ) as Observable<MessageType>;
  }

  dispatch(message: MessageType): void {
    const m = message as any;
    const processId = !!m.processId
      ? m.processId
      : 'NO_PROCESS_ID                       ';
    console.log(
      processId,
      this.queueToTypeMap()[this.queueProcessor],
      m.type,
      !!m.id ? `eventId: ${m.id}` : '',
    );
    this.queueRegistryService.dispatch(this.queueProcessor, message);
  }

  add(message: MessageType): void {
    this.messages.push(message);
  }

  dispatchAll(): void {
    this.messages.forEach(m => this.dispatch(m));
    this.messages = [];
  }

  private queueToTypeMap() {
    const map = {};
    map[CqrsQueueProcessors.COMMAND_QUEUE] = 'command';
    map[CqrsQueueProcessors.EVENT_QUEUE] = 'event';
    map[CqrsQueueProcessors.ERROR_QUEUE] = 'error';
    return map;
  }
}
