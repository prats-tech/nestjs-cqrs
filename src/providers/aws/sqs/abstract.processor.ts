import { CqrsModuleOptions, AbstractMessage } from '../../../types';
import { AbstractBusService, QueueRegistryService } from '../../../services';
import { CqrsQueueProcessors } from '../../../enums';

import { AwsSqsQueue } from '../rx-sqs';

export class AwsSQSAbstractQueueProcessor {
  constructor(
    private queueRegistryService: QueueRegistryService,
    private abstractBusService: AbstractBusService<AbstractMessage>,
    private cqrsOptions: CqrsModuleOptions,
    private queueProcessor: CqrsQueueProcessors,
  ) {
    const { aws } = this.cqrsOptions;

    const provider = {
      COMMAND_QUEUE: aws.sqs.commandQueueUrl,
      EVENT_QUEUE: aws.sqs.eventQueueUrl,
      ERROR_QUEUE: aws.sqs.errorQueueUrl,
    };

    const queueUrl = provider[queueProcessor];

    const {
      longPollWaitTimeSeconds,
      receiveMessagesWaitTimeSeconds,
      randomizeReceiveTimes,
    } = aws.sqs;

    const sqsQueue = new AwsSqsQueue({
      clientConfig: aws.sqs.client,
      queueUrl: queueUrl,
      longPollWaitTimeSeconds,
      receiveMessagesWaitTimeSeconds,
      randomizeReceiveTimes,
    });

    this.abstractBusService.observable().subscribe({
      next: async message => {
        await sqsQueue.dispatch(message);
      },
    });

    sqsQueue.listen().subscribe({
      next: message => {
        this.queueRegistryService.handle(
          this.queueProcessor,
          JSON.parse(message.Body),
        );
      },
    });
  }
}
