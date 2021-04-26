import { AbstractMessage } from "../types";
import { AbstractHandlerContract } from "../contracts";
import { CqrsQueueProcessors, Metatypes } from "../enums";
import { QueueRegistry } from "../static";

export abstract class AbstractHandler<MessageType extends AbstractMessage>
  implements AbstractHandlerContract<MessageType> {
  constructor(
    protected readonly queueProcessor: CqrsQueueProcessors,
    protected readonly metaType: Metatypes
  ) {
    QueueRegistry.getInstance()
      .getHandlerObservable(
        this.queueProcessor,
        Reflect.getMetadata(metaType, this)
      )
      .subscribe({
        next: (message: MessageType) => {
          const m = message as any;
          const className = Object.getPrototypeOf(this).constructor.name;
          const strObj = !!m.id
            ? `{type: ${m.type}, id: ${m.id}}`
            : `{type: ${m.type}}`;
          console.log(`${m.processId}     ${className}(${strObj})`);
          this.handle(message);
        },
      });
  }

  abstract handle(message: MessageType);
}
