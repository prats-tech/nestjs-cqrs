import { Observable } from 'rxjs';

import { AbstractMessage } from '../types';

export interface AbstractBusContract<MessageType extends AbstractMessage> {
  // returns the observable for the message queue
  observable(): Observable<MessageType>;
  // add message to internal cache for later dispatch
  add(message: MessageType): void;
  // directly dispatch message
  dispatch(message: MessageType): void;
  // dispatch all cached messages
  dispatchAll(): void;
}
