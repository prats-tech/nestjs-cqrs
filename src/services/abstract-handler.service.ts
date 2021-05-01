import { AbstractError, AbstractMessage, MessageHandlerError } from "../types";
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
        next: async (message: MessageType) => {
          const m = message as any;
          const className = Object.getPrototypeOf(this).constructor.name;
          const strObj = !!m.id
            ? `{type: ${m.type}, id: ${m.id}}`
            : `{type: ${m.type}}`;
          const processId = !!(m.processId) ? m.processId : 'NO_PROCESS_ID                       '
          console.log(`${processId}     ${className}(${strObj})`);
          try {
            await this.handle(message);
          } catch (err) {
            if (!(message instanceof AbstractError)) {
              let error: AbstractError = null;
              if (err.errorClass) {
                error = new err.errorClass(message.processId, err.message, message);
              } else {
                error = new MessageHandlerError(message.processId, err.message, message);
              }
              QueueRegistry.getInstance().dispatch(CqrsQueueProcessors.ERROR_QUEUE, error);
            } else console.log('ERROR HANDLER ERROR:', message, err.message);
          }
        },
      });
  }

  abstract handle(message: MessageType);
}
