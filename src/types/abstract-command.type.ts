import { AbstractMessage } from './abstract-message.type';

export class AbstractCommand extends AbstractMessage {
  constructor(processId?: string) {
    super(processId);
  }
}
