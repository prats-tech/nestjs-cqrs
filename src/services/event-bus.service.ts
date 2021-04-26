import { Injectable } from "@nestjs/common";

import { CqrsQueueProcessors } from "../enums";
import { AbstractMessage } from "../types";

import { QueueRegistryService } from "./queue-registry.service";
import { AbstractBusService } from "./abstract-bus.service";

@Injectable()
export class EventBusService extends AbstractBusService<AbstractMessage> {
  constructor(queueRegistryService: QueueRegistryService) {
    super(CqrsQueueProcessors.EVENT_QUEUE, queueRegistryService);
  }
}
