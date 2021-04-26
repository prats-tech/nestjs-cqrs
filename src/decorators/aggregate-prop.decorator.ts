import { AggregateRoot } from "../aggregates";

export interface AggregatePropConfig {
  source: NewableFunction;
  field?: string;
}

export function AggregateProp(config: AggregatePropConfig): PropertyDecorator {
  return function (target: AggregateRoot, propertyKey: string) {
    const getter = function () {
      return this.getModelProp(config.source.name, config.field ?? propertyKey);
    };
    const setter = function (newValue: any) {
      this.setModelProp(
        config.source.name,
        config.field ?? propertyKey,
        newValue
      );
    };
    Object.defineProperty(target, propertyKey, {
      get: getter,
      set: setter,
      enumerable: true,
      configurable: true,
    });
  };
}
