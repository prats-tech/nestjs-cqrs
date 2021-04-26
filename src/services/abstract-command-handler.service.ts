import { AbstractMessage } from "../types";
import { CqrsQueueProcessors, Metatypes } from "../enums";
import { AbstractHandler } from "../services";

export abstract class AbstractCommandHandler<
  MessageType extends AbstractMessage
> extends AbstractHandler<MessageType> {
  constructor() {
    super(CqrsQueueProcessors.COMMAND_QUEUE, Metatypes.CommandHandler);
  }

  abstract handle(message: MessageType);
}
