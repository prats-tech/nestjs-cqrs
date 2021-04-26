export interface AggregateSourceContract<T> {
  findAll(): Promise<T[]>;
  findOne(id: string | number): Promise<T>;
  findOneOrCreate(id: string | number): Promise<T>;
  create(id: string | number): Promise<T>;
  save(model: T): Promise<T>;
  delete(model: T): Promise<boolean>;
}
