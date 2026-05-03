/** Checks if value is not undefined or null. */
export function isDefined<T>(value: T): value is NonNullable<T> {
  return null != value;
}
