import { LoggerService } from '@nestjs/common';

export class CqrsLogService implements LoggerService {
  log(message: string) {
    console.log(message);
  }

  error(message: string, trace: string) {
    console.log(message, trace);
  }

  warn(message: string) {
    console.log(message);
  }
}
