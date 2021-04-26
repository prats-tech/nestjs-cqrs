import { AbstractMessage } from "../types";
import { CqrsQueueProcessors, Metatypes } from "../enums";
import { AbstractHandler } from "../services";

export abstract class AbstractEventHandler<
  MessageType extends AbstractMessage
> extends AbstractHandler<MessageType> {
  constructor() {
    super(CqrsQueueProcessors.EVENT_QUEUE, Metatypes.EventHandler);
  }

  abstract handle(message: MessageType);
}
