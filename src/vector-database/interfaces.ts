export interface VectorDatabaseEntry {
  id: string;
  text: string;
  vector: Float32Array | readonly number[];
  createdAt: Date | number | string;
  categories: readonly string[];
}
