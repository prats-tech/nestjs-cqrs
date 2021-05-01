import { Metatypes } from '../enums';

export function Event(eventName?: string): ClassDecorator {
  return (target: any) => {
    if (!eventName) eventName = target.name;
    Reflect.defineMetadata(Metatypes.Message, eventName, target);
    Reflect.defineMetadata(Metatypes.Message, eventName, target.prototype);
  };
}
