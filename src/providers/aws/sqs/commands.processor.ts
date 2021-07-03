import { Inject, Injectable } from '@nestjs/common';

import { CqrsModuleOptions } from '../../../types';
import { CommandBusService, QueueRegistryService } from '../../../services';
import { CqrsQueueProcessors } from '../../../enums';

import { AwsSQSAbstractQueueProcessor } from './abstract.processor';

@Injectable()
export class AwsSQSCommandQueueProcessor extends AwsSQSAbstractQueueProcessor {
  constructor(
    queueRegistryService: QueueRegistryService,
    commandBusService: CommandBusService,
    @Inject('CQRS-OPTIONS') cqrsOptions: CqrsModuleOptions,
  ) {
    super(
      queueRegistryService,
      commandBusService,
      cqrsOptions,
      CqrsQueueProcessors.COMMAND_QUEUE,
    );
  }
}
