import { CqrsQueueProcessors, Metatypes } from "../enums";
import { AbstractMessage } from "../types";

import { MessageHandler } from "./message-handler.decorator";

export function CommandHandler(
  messageType: typeof AbstractMessage
): ClassDecorator {
  return (target: any) => {
    return MessageHandler(
      CqrsQueueProcessors.COMMAND_QUEUE,
      Metatypes.CommandHandler,
      messageType
    )(target);
  };
}
