import { Inject, Injectable } from '@nestjs/common';

import { CqrsModuleOptions } from '../../../types';
import { ErrorBusService, QueueRegistryService } from '../../../services';
import { CqrsQueueProcessors } from '../../../enums';

import { AwsSQSAbstractQueueProcessor } from './abstract.processor';

@Injectable()
export class AwsSQSErrorsQueueProcessor extends AwsSQSAbstractQueueProcessor {
  constructor(
    queueRegistryService: QueueRegistryService,
    errorBusService: ErrorBusService,
    @Inject('CQRS-OPTIONS') cqrsOptions: CqrsModuleOptions,
  ) {
    super(
      queueRegistryService,
      errorBusService,
      cqrsOptions,
      CqrsQueueProcessors.ERROR_QUEUE,
    );
  }
}
