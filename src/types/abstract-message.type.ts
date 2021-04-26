import { Metatypes } from "../enums";

export class AbstractMessage {
  readonly type: string;

  constructor() {
    this.type = Reflect.getMetadata(Metatypes.Message, this);
  }
}
