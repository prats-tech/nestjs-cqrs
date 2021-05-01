import { Error } from '../decorators';
import { AbstractError } from './abstract-error.type';
import { AbstractMessage } from './abstract-message.type';

@Error('error.message_handler')
export class MessageHandlerError extends AbstractError {
  constructor(processId?: string, message?: string, readonly event?: AbstractMessage) {
    super(processId, message);
  }
}
