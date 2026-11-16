/**
 * Compares two values one level deep, like `zustand/shallow`: primitives with `Object.is`, arrays
 * item by item and plain objects key by key.
 */
export function shallowEqual(a: unknown, b: unknown): boolean {
  if (Object.is(a, b)) {
    return true
  }

  if (typeof a !== 'object' || typeof b !== 'object' || a === null || b === null) {
    return false
  }

  if (Array.isArray(a) !== Array.isArray(b)) {
    return false
  }

  const aRecord = a as Record<string, unknown>
  const bRecord = b as Record<string, unknown>
  const keys = Object.keys(aRecord)

  return (
    keys.length === Object.keys(bRecord).length &&
    keys.every((key) => Object.hasOwn(bRecord, key) && Object.is(aRecord[key], bRecord[key]))
  )
}

/**
 * Returns `previous` when it is shallowly equal to `next`. Used in `computed((previous) => …)` so
 * a computed that builds a new object or array only notifies its dependents when the contents
 * change.
 */
export function keepIfEqual<T>(next: T, previous: T | undefined): T {
  return previous !== undefined && shallowEqual(previous, next) ? previous : next
}
