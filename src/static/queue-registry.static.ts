import { Subject } from "rxjs";

import { CqrsQueueProcessors, Metatypes } from "../enums";
import {
  NewableClass,
  AbstractMessage,
  CqrsModuleQueueOptions,
} from "../types";

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

export class QueueRegistry {
  // singleton
  private static instance: QueueRegistry;
  public static getInstance() {
    if (!this.instance) this.instance = new QueueRegistry();
    return this.instance;
  }

  // instance
  private queueMap: QueueMap;
  public queueOptions: CqrsModuleQueueOptions;

  constructor() {
    this.createQueueMap();
  }

  dispatch(
    queueProcessor: CqrsQueueProcessors,
    message: AbstractMessage
  ): void {
    if (
      (this.queueOptions.commands &&
        queueProcessor === CqrsQueueProcessors.COMMAND_QUEUE) ||
      (this.queueOptions.events &&
        queueProcessor === CqrsQueueProcessors.EVENT_QUEUE)
    ) {
      this.nonQueueHandle(queueProcessor, message);
    } else this.queueMap[queueProcessor].subject.next(message);
  }

  handle(queueProcessor: CqrsQueueProcessors, message: AbstractMessage) {
    const messageMap = this.getMessageMap(queueProcessor, message.type);

    if (!messageMap.class) {
      console.log(`No handler for this ${message.type}`);
      return;
    }

    const properMessage = Object.assign(new messageMap.class(), message);
    messageMap.subject.next(properMessage);
  }

  nonQueueHandle(
    queueProcessor: CqrsQueueProcessors,
    message: AbstractMessage
  ) {
    const messageMap = this.getMessageMap(queueProcessor, message.type);

    if (!messageMap.class) {
      console.log(`No handler for this ${message.type}`);
      return;
    }

    messageMap.subject.next(message);
  }

  getProcessorObservable(queueProcessor: CqrsQueueProcessors) {
    return this.queueMap[queueProcessor].subject.asObservable();
  }

  getHandlerObservable(
    queueProcessor: CqrsQueueProcessors,
    messageClass: NewableClass
  ) {
    return this.getMessageMap(
      queueProcessor,
      Reflect.getMetadata(Metatypes.Message, messageClass)
    ).subject.asObservable();
  }

  registerHandler(
    queueProcessor: CqrsQueueProcessors,
    messageClass: NewableClass
  ) {
    const messageClassType = Reflect.getMetadata(
      Metatypes.Message,
      messageClass
    );
    const messageMap = this.getMessageMap(queueProcessor, messageClassType);
    messageMap.type = messageClassType;
    messageMap.class = messageClass;
  }

  private createQueueMap() {
    this.queueMap = {} as QueueMap;
    Object.keys(CqrsQueueProcessors).forEach(
      (k) =>
        (this.queueMap[CqrsQueueProcessors[k]] = {
          subject: new Subject<AbstractMessage>(),
          messageMap: {} as MessageMap,
        })
    );
  }

  private getMessageMap(
    queueProcessor: CqrsQueueProcessors,
    messageType: string
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

/* 

 App -> (single observable) -> Processor -> queue
 Queue -> Processor -> (typed observables)(map data to type) -> App

*/
