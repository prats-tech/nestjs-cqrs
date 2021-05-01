import { Injectable } from '@nestjs/common';

import { QueueRegistry } from '../static';
import { CqrsQueueProcessors, Metatypes } from '../enums';
import { AbstractMessage } from '../types';

export function MessageHandler(
  queueProcessor: CqrsQueueProcessors,
  metaType: Metatypes,
  messageType: typeof AbstractMessage,
): ClassDecorator {
  return (target: any) => {
    QueueRegistry.getInstance().registerHandler(queueProcessor, messageType);
    Reflect.defineMetadata(metaType, messageType, target.prototype);
    return Injectable()(target);
  };
}
