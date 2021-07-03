import { Inject, Injectable } from '@nestjs/common';

import { CqrsModuleOptions } from '../../../types';
import { EventBusService, QueueRegistryService } from '../../../services';
import { CqrsQueueProcessors } from '../../../enums';

import { AwsSQSAbstractQueueProcessor } from './abstract.processor';

@Injectable()
export class AwsSQSEventQueueProcessor extends AwsSQSAbstractQueueProcessor {
  constructor(
    queueRegistryService: QueueRegistryService,
    eventBusService: EventBusService,
    @Inject('CQRS-OPTIONS') cqrsOptions: CqrsModuleOptions,
  ) {
    super(
      queueRegistryService,
      eventBusService,
      cqrsOptions,
      CqrsQueueProcessors.EVENT_QUEUE,
    );
  }
}
