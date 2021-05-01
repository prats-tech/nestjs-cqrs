import { CqrsQueueProcessors, Metatypes } from '../enums';
import { AbstractMessage } from '../types';

import { MessageHandler } from './message-handler.decorator';

export function ErrorHandler(
  messageType: typeof AbstractMessage,
): ClassDecorator {
  return (target: any) => {
    return MessageHandler(
      CqrsQueueProcessors.ERROR_QUEUE,
      Metatypes.ErrorHandler,
      messageType,
    )(target);
  };
}
