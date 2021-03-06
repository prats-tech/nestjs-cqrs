import { Subject } from 'rxjs';

import { CqrsQueueProcessors, Metatypes } from '../enums';
import {
  NewableClass,
  AbstractMessage,
  CqrsModuleAsyncOptions,
} from '../types';

type MessageMapValue = {
  type: string;
  class: NewableClass;
  subject: Subject<AbstractMessage>;
};

type MessageMap = {
  [prop: string]: MessageMapValue;
};

type QueueMapValue = {
  subject: Subject<AbstractMessage>;
  messageMap: MessageMap;
};

type QueueMap = {
  [prop: string]: QueueMapValue;
};

type DispatchQueueCheckingMap = {
  [prop: string]: string;
};

export class QueueRegistry {
  // singleton
  private static instance: QueueRegistry;
  public static getInstance() {
    if (!this.instance) this.instance = new QueueRegistry();
    return this.instance;
  }

  // instance
  private dispatchQueueCheckingMap: DispatchQueueCheckingMap;
  private queueMap: QueueMap;
  public asyncOptions: CqrsModuleAsyncOptions;

  constructor() {
    this.createQueueMap();
  }

  dispatch(
    queueProcessor: CqrsQueueProcessors,
    message: AbstractMessage,
  ): void {
    if (this.asyncOptions[this.dispatchQueueCheckingMap[queueProcessor]]) {
      this.queueMap[queueProcessor].subject.next(message);
    } else {
      this.nonQueueHandle(queueProcessor, message);
    }
  }

  handle(queueProcessor: CqrsQueueProcessors, message: AbstractMessage) {
    const messageMap = this.getMessageMap(queueProcessor, message.type);

    if (!messageMap.class) {
      return this.noHandler(queueProcessor, message);
    }

    const properMessage = Object.assign(new messageMap.class(), message);
    messageMap.subject.next(properMessage);
  }

  nonQueueHandle(
    queueProcessor: CqrsQueueProcessors,
    message: AbstractMessage,
  ) {
    const messageMap = this.getMessageMap(queueProcessor, message.type);

    if (!messageMap.class) {
      return this.noHandler(queueProcessor, message);
    }

    messageMap.subject.next(message);
  }

  noHandler(queueProcessor: CqrsQueueProcessors, message: AbstractMessage) {
    console.log(`No handler for this ${message.type}`);
    if (queueProcessor === CqrsQueueProcessors.ERROR_QUEUE) {
      console.log('--------');
      console.log((message as any).event);
      console.log((message as any).message);
      console.log('--------');
    }
  }

  getProcessorObservable(queueProcessor: CqrsQueueProcessors) {
    return this.queueMap[queueProcessor].subject.asObservable();
  }

  getHandlerObservable(
    queueProcessor: CqrsQueueProcessors,
    messageClass: NewableClass,
  ) {
    return this.getMessageMap(
      queueProcessor,
      Reflect.getMetadata(Metatypes.Message, messageClass),
    ).subject.asObservable();
  }

  registerHandler(
    queueProcessor: CqrsQueueProcessors,
    messageClass: NewableClass,
  ) {
    const messageClassType = Reflect.getMetadata(
      Metatypes.Message,
      messageClass,
    );
    const messageMap = this.getMessageMap(queueProcessor, messageClassType);
    messageMap.type = messageClassType;
    messageMap.class = messageClass;
  }

  private createQueueMap() {
    this.queueMap = {} as QueueMap;
    Object.keys(CqrsQueueProcessors).forEach(
      k =>
        (this.queueMap[CqrsQueueProcessors[k]] = {
          subject: new Subject<AbstractMessage>(),
          messageMap: {} as MessageMap,
        }),
    );
    this.createDispatchQueueCheckingMap();
  }

  private createDispatchQueueCheckingMap() {
    this.dispatchQueueCheckingMap = {};
    this.dispatchQueueCheckingMap[CqrsQueueProcessors.COMMAND_QUEUE] =
      'commands';
    this.dispatchQueueCheckingMap[CqrsQueueProcessors.EVENT_QUEUE] = 'events';
    this.dispatchQueueCheckingMap[CqrsQueueProcessors.ERROR_QUEUE] = 'errors';
  }

  private getMessageMap(
    queueProcessor: CqrsQueueProcessors,
    messageType: string,
  ) {
    const queue = this.queueMap[queueProcessor];
    if (!(messageType in queue.messageMap)) {
      queue.messageMap[messageType] = {
        type: messageType,
        class: null,
        subject: new Subject<AbstractMessage>(),
      } as MessageMapValue;
    }
    return queue.messageMap[messageType];
  }
}
