import { Injectable } from '@nestjs/common';

import { CqrsQueueProcessors } from '../enums';
import { AbstractMessage } from '../types';

import { CqrsLogService } from './cqrs-log.service';

import { QueueRegistryService } from './queue-registry.service';
import { AbstractBusService } from './abstract-bus.service';

@Injectable()
export class CommandBusService extends AbstractBusService<AbstractMessage> {
  constructor(
    queueRegistryService: QueueRegistryService,
    cqrsLogService: CqrsLogService,
  ) {
    super(
      CqrsQueueProcessors.COMMAND_QUEUE,
      queueRegistryService,
      cqrsLogService,
    );
  }
}
