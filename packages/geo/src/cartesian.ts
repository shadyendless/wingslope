/**
 * Computes the Cartesian product of multiple arrays.
 *
 * @template T
 * the type of elements in the input arrays.
 * @param {...T[][]} all
 * a variadic number of arrays to compute the Cartesian product of.
 * @returns {T[][]}
 * An array containing all possible combinations of elements from the input
 * arrays, where each combination is represented as an array.
 *
 * @remarks
 * pure function
 *
 * @example
 * ```typescript
 * const result = cartesian([1, 2], ['a', 'b']);
 * // result: [[1, 'a'], [1, 'b'], [2, 'a'], [2, 'b']]
 * ```
 */
export function cartesian<T>(...all: T[][]): T[][] {
  return all.reduce<T[][]>(
    (results, entries) =>
      results
        .map((result) => entries.map((entry) => result.concat([entry])))
        .reduce((sub, res) => sub.concat(res), []),
    [[]],
  )
}
