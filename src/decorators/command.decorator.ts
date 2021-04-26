import { Metatypes } from "../enums";

export function Command(commandName?: string): ClassDecorator {
  return (target: any) => {
    if (!commandName) commandName = target.name;
    Reflect.defineMetadata(Metatypes.Message, commandName, target);
    Reflect.defineMetadata(Metatypes.Message, commandName, target.prototype);
  };
}
