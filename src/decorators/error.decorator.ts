import { Metatypes } from '../enums';

export function Error(errorName?: string): ClassDecorator {
  return (target: any) => {
    if (!errorName) errorName = target.name;
    Reflect.defineMetadata(Metatypes.Message, errorName, target);
    Reflect.defineMetadata(Metatypes.Message, errorName, target.prototype);
  };
}
