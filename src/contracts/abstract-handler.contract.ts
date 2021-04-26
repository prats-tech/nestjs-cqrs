import { AbstractMessage } from "../types";

export interface AbstractHandlerContract<MessageType extends AbstractMessage> {
  handle(message: MessageType);
}
