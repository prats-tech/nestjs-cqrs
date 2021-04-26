/* eslint-disable @typescript-eslint/no-unused-vars */
import { InjectQueue, OnQueueFailed, Process, Processor } from "@nestjs/bull";

import { Job, Queue } from "bull";

import { CqrsQueueProcessors } from "../../enums";
import { CommandBusService, QueueRegistryService } from "../../services";

@Processor(CqrsQueueProcessors.COMMAND_QUEUE)
export class CommandQueueProcessor {
  constructor(
    @InjectQueue(CqrsQueueProcessors.COMMAND_QUEUE)
    private readonly queue: Queue,
    private readonly queueRegistryService: QueueRegistryService,
    private readonly commandBus: CommandBusService
  ) {
    this.commandBus.observable().subscribe({
      next: this.onMessageDispatch.bind(this),
    });
  }

  @OnQueueFailed()
  onError(job: Job<any>, error: any) {
    console.log("error", error, job.data);
  }

  @Process(CqrsQueueProcessors.COMMAND_QUEUE)
  process(job: Job<any>) {
    this.queueRegistryService.handle(
      CqrsQueueProcessors.COMMAND_QUEUE,
      job.data
    );
  }

  async onMessageDispatch(message: any) {
    await this.queue.add(CqrsQueueProcessors.COMMAND_QUEUE, message);
  }
}
