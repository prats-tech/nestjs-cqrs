import { v4 as uuidV4 } from 'uuid';

import { AbstractMessage } from './abstract-message.type';

export abstract class AbstractError extends AbstractMessage {
  readonly id: string;

  constructor(processId?: string, readonly message?: string) {
    super(processId);
    this.id = uuidV4();
  }
}
