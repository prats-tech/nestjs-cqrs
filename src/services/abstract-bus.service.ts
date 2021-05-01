import { Observable } from 'rxjs';

import { AbstractBusContract } from '../contracts';
import { CqrsQueueProcessors } from '../enums';
import { AbstractMessage } from '../types';

import { CqrsLogService } from './cqrs-log.service';

import { QueueRegistryService } from './queue-registry.service';

export class AbstractBusService<MessageType extends AbstractMessage>
  implements AbstractBusContract<MessageType> {
  private messages: MessageType[] = [];

  constructor(
    protected readonly queueProcessor: CqrsQueueProcessors,
    protected readonly queueRegistryService: QueueRegistryService,
    protected readonly cqrsLogService: CqrsLogService,
  ) {
    const className = Object.getPrototypeOf(this).constructor.name;
    this.cqrsLogService.setContext(className);
  }

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

    const logMessage = this.logMessage(
      processId,
      this.queueToTypeMap()[this.queueProcessor],
      m.type,
      m.message,
      m.id,
    );

    this.cqrsLogService.log(logMessage);

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

  public logMessage(
    processId: string,
    queueType: string,
    messageType: string,
    content?: string,
    eventId?: string,
  ): string {
    let message = `Process: ${processId} | Queue: ${queueType} | Type: ${messageType}`;

    if (content) {
      message += ` | Message: ${content}`;
    }

    if (eventId) {
      message += ` | Event: ${eventId}`;
    }

    return message;
  }
}
