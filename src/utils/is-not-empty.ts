/** Checks if value is not an empty value (undefined, null, empty string). */
export function isNotEmpty<T>(value: T): value is Exclude<NonNullable<T>, ''> {
  return undefined !== value && null !== value && '' !== value;
}
