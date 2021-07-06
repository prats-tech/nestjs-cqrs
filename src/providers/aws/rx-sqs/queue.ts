import { Observable, Subject } from 'rxjs';

import {
  SQSClientConfig,
  SQSClient,
  SendMessageCommand,
  ReceiveMessageCommand,
  Message,
  DeleteMessageCommand,
} from '@aws-sdk/client-sqs';

export type AwsSqsQueueConfig = {
  clientConfig: SQSClientConfig;
  queueUrl: string;
  // if this is 0 means short polling
  longPollWaitTimeSeconds: number;
  // timeout for receive checking for messages
  receiveMessagesWaitTimeSeconds: number;
  // if is true, the receive time is random
  randomizeReceiveTimes?: boolean;
};

export class AwsSqsQueue {
  private client: SQSClient;
  private subject: Subject<any>;

  constructor(private config: AwsSqsQueueConfig) {
    this.client = new SQSClient(this.config.clientConfig);
    this.subject = new Subject();
  }

  async dispatch(message: any): Promise<void> {
    const messageCommand = new SendMessageCommand({
      QueueUrl: this.config.queueUrl,
      MessageBody: JSON.stringify(message),
    });
    await this.client.send(messageCommand);
  }

  listen(): Observable<Message> {
    setTimeout(() => this.poll(), this.calcTimeout());
    return this.subject.asObservable();
  }

  private calcTimeout() {
    if (this.config.randomizeReceiveTimes) {
      const seed = Math.random() * this.config.receiveMessagesWaitTimeSeconds;
      return Math.floor(seed) * 1000 + 1000;
    }
    return this.config.receiveMessagesWaitTimeSeconds * 1000;
  }

  private async poll() {
    const waitTime =
      this.config.longPollWaitTimeSeconds <= 0
        ? 0
        : this.config.longPollWaitTimeSeconds > 20
        ? 20
        : this.config.longPollWaitTimeSeconds;

    const receiveMessageCommand = new ReceiveMessageCommand({
      QueueUrl: this.config.queueUrl,
      WaitTimeSeconds: waitTime,
    });
    const { Messages } = await this.client.send(receiveMessageCommand);
    if (Messages?.length) {
      await Promise.all(Messages.map(message => this.processMessage(message)));
    }
    setTimeout(() => this.poll(), this.calcTimeout());
  }

  private async processMessage(message: Message) {
    const deleteMessageCommand = new DeleteMessageCommand({
      QueueUrl: this.config.queueUrl,
      ReceiptHandle: message.ReceiptHandle,
    });
    await this.client.send(deleteMessageCommand);
    this.subject.next(message);
  }
}
