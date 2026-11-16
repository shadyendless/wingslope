import { lexer, type Tokens } from './lexer'
import { pipesRunner } from './pipes'
import { violation } from './violation'
import type { Errors, Format } from '.'

export type ParseResults = [Tokens, Errors]

/**
 * Parse a raw input string into a validated and normalized coordinate
 * primitive ready for further refinement/validation by a more specific parser.
 *
 * @param input
 * raw input, from a user or external system, of unknown validity
 *
 * @param format
 * the expected format - LATLON or LONLAT - the coordinate should conform to
 *
 * @returns
 * tuple with two values: tokens, and errors
 *
 * @remarks
 * pure function
 *
 * @example
 * ```typescript
 * const input = '1 2 3 / 4 5 6'
 * parse(input); // [['1', '2', '3', '/', '4', '5', '6'], []]
 * ```
 *
 * @description
 * __Assumptions/Specification__
 * 1. Decimals are indicated by a "." and not ","
 * 2. A degrees indicator is "°"
 * 3. A minutes indicator is "'"
 * 4. A seconds indicator is '"'
 * 5. Each indicator is expected to follow the number it is annotating
 * 6. Numeric parts - degrees, minutes, and seconds - are positional and can
 *    not be arranged in alternative orders and be considered valid
 * 7. Output will have explicit bearings characters (NSEW) and not rely on
 *    positive and negative values; when bearings are available. Negative
 *    values will only be replaced with absolute values if bearings are available.
 *
 */
export function parse(input: string, format?: Format): ParseResults {
  if (!input?.length) {
    return [[], [violation('No input.')]]
  }

  // Find isolated letters (not part of a larger word)
  const isolatedLetters = input.match(/(?<![a-z])[a-z](?![a-z])/gi)

  // Reject if any isolated letter is not a valid cardinal direction (N, S, E, W)
  if (isolatedLetters?.some((ch) => !/^[nsew]$/i.test(ch))) {
    return [[], [violation('Unrecognized characters in input.')]]
  }

  const [tokens, errors] = pipesRunner(lexer(input), format)

  return [tokens, errors?.length ? errors.map(violation) : []]
}
