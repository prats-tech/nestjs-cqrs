import { Inject, Injectable } from '@nestjs/common';

import {
  DeleteMessageCommand,
  Message,
  ReceiveMessageCommand,
  SendMessageCommand,
  SQSClient,
} from '@aws-sdk/client-sqs';

import { CqrsModuleOptions, AbstractMessage } from '../../../types';
import { AbstractBusService, QueueRegistryService } from '../../../services';
import { CqrsQueueProcessors } from '../../../enums';

export class AwsSQSAbstractQueueProcessor {
  private client: SQSClient;
  private queueUrl: string;

  constructor(
    private queueRegistryService: QueueRegistryService,
    private abstractBusService: AbstractBusService<AbstractMessage>,
    private cqrsOptions: CqrsModuleOptions,
    private queueProcessor: CqrsQueueProcessors,
  ) {
    this.abstractBusService.observable().subscribe({
      next: this.onMessageDispatch.bind(this),
    });

    const { aws } = this.cqrsOptions;

    this.client = new SQSClient(aws.sqs.client);

    const provider = {
      COMMAND_QUEUE: aws.sqs.commandQueueUrl,
      EVENT_QUEUE: aws.sqs.eventQueueUrl,
      ERROR_QUEUE: aws.sqs.errorQueueUrl,
    };

    this.queueUrl = provider[queueProcessor];

    this.consume();
  }

  async onMessageDispatch(message: any) {
    const messageCommand = new SendMessageCommand({
      QueueUrl: this.queueUrl,
      MessageBody: JSON.stringify(message),
    });
    await this.client.send(messageCommand);
  }

  async consume() {
    const receiveMessageCommand = new ReceiveMessageCommand({
      QueueUrl: this.queueUrl,
      WaitTimeSeconds: this.cqrsOptions.aws.sqs.waitTimeSeconds ?? 3,
    });
    const { Messages } = await this.client.send(receiveMessageCommand);
    if (Messages?.length) {
      await Promise.all(Messages.map(this.processMessage()));
    }
  }

  private processMessage() {
    return async (message: Message): Promise<void> => {
      this.queueRegistryService.handle(
        this.queueProcessor,
        JSON.parse(message.Body),
      );

      const deleteMessageCommand = new DeleteMessageCommand({
        QueueUrl: this.queueUrl,
        ReceiptHandle: message.ReceiptHandle,
      });

      await this.client.send(deleteMessageCommand);
    };
  }
}
