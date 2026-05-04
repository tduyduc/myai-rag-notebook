import type { Float32, Utf8, Vector } from 'apache-arrow';

export interface VectorDatabaseEntry {
  id: string;
  text: string;
  vector: Vector<Float32> | Float32Array | readonly number[];
  createdAt: Date | number | string;
  categories: Vector<Utf8> | readonly string[];
}
