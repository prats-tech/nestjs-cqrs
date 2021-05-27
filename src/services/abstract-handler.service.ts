import { Logger } from '@nestjs/common';

import { AbstractError, AbstractMessage, MessageHandlerError } from '../types';
import { AbstractHandlerContract } from '../contracts';
import { CqrsQueueProcessors, Metatypes } from '../enums';
import { QueueRegistry } from '../static';
import { CqrsLogService } from './cqrs-log.service';

export abstract class AbstractHandler<MessageType extends AbstractMessage>
  implements AbstractHandlerContract<MessageType> {
  private logger: Logger;

  constructor(
    protected readonly queueProcessor: CqrsQueueProcessors,
    protected readonly metaType: Metatypes,
  ) {
    const className = Object.getPrototypeOf(this).constructor.name;

    this.logger = new Logger(className);

    QueueRegistry.getInstance()
      .getHandlerObservable(
        this.queueProcessor,
        Reflect.getMetadata(metaType, this),
      )
      .subscribe({
        next: async (message: MessageType) => await this.next(message),
      });
  }

  private async next(message: MessageType) {
    const m = message as any;
    const className = Object.getPrototypeOf(this).constructor.name;

    const strObj = !!m.id
      ? `{type: ${m.type}, id: ${m.id}}`
      : `{type: ${m.type}}`;

    const processId = !!m.processId
      ? m.processId
      : 'NO_PROCESS_ID                       ';

    this.logger.log(`${processId}     ${className}(${strObj})`);

    try {
      await this.handle(message);
    } catch (err) {
      if (!(message instanceof AbstractError)) {
        let error: AbstractError = null;

        error = err.errorClass
          ? new err.errorClass(message.processId, err.message, message)
          : new MessageHandlerError(message.processId, err.message, message);

        QueueRegistry.getInstance().dispatch(
          CqrsQueueProcessors.ERROR_QUEUE,
          error,
        );
      } else {
        this.logger.log(`ERROR HANDLER ERROR:' ${err.message}`);
        this.logger.log(message);
      }
    }
  }

  abstract handle(message: MessageType);
}
