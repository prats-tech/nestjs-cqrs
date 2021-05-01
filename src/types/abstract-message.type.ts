import { Metatypes } from "../enums";

export class AbstractMessage {
  readonly type: string;

  constructor(readonly processId?: string) {
    this.type = Reflect.getMetadata(Metatypes.Message, this);
  }
}
