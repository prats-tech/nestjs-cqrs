import { AbstractMessage } from '../types';
import { CqrsQueueProcessors, Metatypes } from '../enums';
import { AbstractHandler } from '../services';

export abstract class AbstractErrorHandler<
  MessageType extends AbstractMessage
> extends AbstractHandler<MessageType> {
  constructor() {
    super(CqrsQueueProcessors.ERROR_QUEUE, Metatypes.ErrorHandler);
  }

  abstract handle(message: MessageType);
}
