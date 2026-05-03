import type { VectorDatabaseEntry } from './interfaces';

export abstract class VectorDatabase {
  abstract save(
    text: string,
    additionalOptions?: {
      id?: string;
      createdAt?: Date;
      categories?: readonly string[];
    },
  ): Promise<VectorDatabaseEntry>;

  abstract find(
    text: string,
    additionalOptions?: {
      limit?: number;
      category?: string;
    },
  ): Promise<VectorDatabaseEntry[]>;
}
