import { Observable } from "rxjs";

import { AbstractBusContract } from "../contracts";
import { CqrsQueueProcessors } from "../enums";
import { AbstractMessage } from "../types";

import { QueueRegistryService } from "./queue-registry.service";

export class AbstractBusService<MessageType extends AbstractMessage>
  implements AbstractBusContract<MessageType> {
  private messages: MessageType[] = [];

  constructor(
    protected readonly queueProcessor: CqrsQueueProcessors,
    protected readonly queueRegistryService: QueueRegistryService
  ) {}

  observable(): Observable<MessageType> {
    return this.queueRegistryService.getProcessorObservable(
      this.queueProcessor
    ) as Observable<MessageType>;
  }

  dispatch(message: MessageType): void {
    this.queueRegistryService.dispatch(this.queueProcessor, message);
    const m = message as any;
    console.log(
      m.processId,
      this.queueProcessor === CqrsQueueProcessors.COMMAND_QUEUE
        ? "command:"
        : "event:",
      m.type,
      !!m.id ? `eventId: ${m.id}` : ""
    );
  }

  add(message: MessageType): void {
    this.messages.push(message);
  }

  dispatchAll(): void {
    this.messages.forEach((m) => this.dispatch(m));
    this.messages = [];
  }
}
