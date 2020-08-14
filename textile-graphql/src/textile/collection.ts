import { Instance } from "@textile/threads-store";
import { FilterQuery } from "@textile/hub";

export interface ICollection<T extends Instance> {
  all(): Promise<T[]>;

  find(query: FilterQuery): Promise<T[]>;

  findById(id: string): Promise<T>;

  deleteCollection(): Promise<void>;

  truncate(): Promise<void>;

  create(value: T): Promise<T>;

  createMany(values: T[]): Promise<T[]>;

  save(value: T): Promise<T>;

  saveMany(values: T[]): Promise<T[]>;

  createOrSave(value: T): Promise<T>;

  createOrSaveMany(values: T[]): Promise<T[]>;

  delete(value: T): Promise<void>;

  deleteMany(values: T[]): Promise<void>;

  deleteById(value: string): Promise<void>;

  deleteManyByIds(values: string[]): Promise<void>;

  observeUpdate(actionTypes: string[], id: string, callback: any): Promise<void>;

  // observeAction(actionTypes: Map<string, Function>, id: string | null);
}
