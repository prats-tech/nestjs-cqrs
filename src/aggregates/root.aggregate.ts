/* eslint-disable @typescript-eslint/ban-types */
import { AggregateSourceContract } from "../contracts";
import { Metatypes } from "../enums";
import { EventBusService } from "../services";

export interface AggregateRootSource {
  model: any;
  changed: boolean;
}

interface AggregateRootSources {
  [prop: string]: AggregateRootSource;
}

interface Services {
  [prop: string]: AggregateSourceContract<any>;
}

export interface AggregateRootConfig {
  id: string;
}

export class AggregateRoot {
  protected sources: AggregateRootSources = {};

  constructor(protected readonly processId?: string) {}

  protected async loadOrNew(id: string | number): Promise<this> {
    return this.initSources(
      async (service) => await service.findOneOrCreate(id)
    );
  }

  protected async load(id: string): Promise<this> {
    return this.initSources(async (service) => await service.findOne(id));
  }

  protected async initSources(fnLoad: Function): Promise<this> {
    const services = this.getServices();
    for (const k in services) {
      this.sources[k] = {
        model: await fnLoad(services[k]),
        changed: false,
      } as AggregateRootSource;
    }
    return this;
  }

  getModelProp(source: string, propertyName: string): any {
    return this.sources[source].model[propertyName];
  }

  setModelProp(source: string, propertyName: string, newValue: any): void {
    const sourceRef = this.sources[source];
    sourceRef.model[propertyName] = newValue;
    sourceRef.changed = true;
  }

  async commit() {
    await Promise.all(
      Object.keys(this.sources).map((key) => {
        const source = this.sources[key];
        if (source.changed) {
          return this.getServiceForSource(key).save(source.model);
        } else return Promise.resolve(source.model);
      })
    );
    this.eventBus().dispatchAll();
  }

  protected eventBus(): EventBusService {
    return Reflect.getMetadata(
      Metatypes.AggregateEventBus,
      this.getClassName()
    ) as EventBusService;
  }

  private getClassName(): string {
    return Object.getPrototypeOf(this).constructor;
  }

  private getServices(): Services {
    return Reflect.getMetadata(
      Metatypes.AggregateServices,
      this.getClassName()
    ) as Services;
  }

  private getServiceForSource(
    sourceName: string
  ): AggregateSourceContract<any> {
    return this.getServices()[sourceName];
  }
}
