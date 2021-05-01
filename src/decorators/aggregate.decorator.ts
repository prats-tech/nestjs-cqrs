import { StaticInjector } from '@prats-tech/nestjs-static-injector';

import { Metatypes } from '../enums';
import { EventBusService } from '../services';

interface AggregateOptions {
  source: any;
  service: any;
}

export function Aggregate(options: AggregateOptions[]): ClassDecorator {
  return (target: any) => {
    StaticInjector.getObservable().subscribe({
      next: staticInjector => {
        const services = {};
        options.forEach(opt => {
          services[opt.source.name] = staticInjector.get(opt.service);
        });
        Reflect.defineMetadata(Metatypes.AggregateServices, services, target);
        Reflect.defineMetadata(
          Metatypes.AggregateEventBus,
          staticInjector.get(EventBusService),
          target,
        );
      },
    });
  };
}
