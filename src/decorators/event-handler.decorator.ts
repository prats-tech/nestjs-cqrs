import { CqrsQueueProcessors, Metatypes } from "../enums";
import { AbstractMessage } from "../types";

import { MessageHandler } from "./message-handler.decorator";

export function EventHandler(
  messageType: typeof AbstractMessage
): ClassDecorator {
  return (target: any) => {
    return MessageHandler(
      CqrsQueueProcessors.EVENT_QUEUE,
      Metatypes.EventHandler,
      messageType
    )(target);
  };
}
