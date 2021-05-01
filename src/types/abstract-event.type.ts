import { v4 as uuidV4 } from 'uuid';

import { AbstractMessage } from './abstract-message.type';

export abstract class AbstractEvent extends AbstractMessage {
  readonly id: string;

  constructor(processId?: string) {
    super(processId);
    this.id = uuidV4();
  }
}
