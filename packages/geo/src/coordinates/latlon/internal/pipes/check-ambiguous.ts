import { type Format, SYMBOL_PATTERNS, SYMBOLS } from '..'
import { pipesResult } from '../pipes'
import { simpler } from './simpler'
import type { Tokens } from '../lexer'

/**
 * Look for groupings of numbers that are ambiguous; no indicators, or no
 * dividers and not possibility of deducing where a divider should be inserted.
 *
 * @param tokens - Array of parsed coordinate tokens.
 * @param _format - Optional coordinate format (LATLON or LONLAT), currently unused.
 * @returns Pipe result with tokens and error status (true if ambiguous, false otherwise).
 *
 * @example
 * ```typescript
 * checkAmbiguousGrouping(['45', '30', '15', 'N'], 'LATLON');
 * // Returns tokens with error=true if grouping is ambiguous
 * ```
 *
 * @example
 * ```typescript
 * checkAmbiguousGrouping(['45', '30', 'N', '/', '122', '15', 'W'], 'LATLON');
 * // Returns tokens with error=false (divider present, not ambiguous)
 * ```
 */
export function checkAmbiguousGrouping(tokens: Tokens, _format?: Format) {
  if (tokens.includes(SYMBOLS.DIVIDER)) {
    return pipesResult(tokens, false)
  }

  const simple = simpler(tokens)

  // 3-5 numbers after or before a single bearing indicator BNNN, NNNB
  const ambiguous = /^(?:(?:BN{3,5})|(?:N{3,5}B))$/.test(simple)
  // 3-5 numbers between 2 bearings indicators BNNNB
  const bookends = /^BN{3,5}B$/.test(simple)
  // "helpful" indicators:
  //   1. degrees number in the right-of-divider position e.g. # #°
  //   2. seconds number in the left-of-divider position e.g. # #" #
  //   3. trailing bearings in the left-of-divider position e.g. # N #
  //   4. leading bearings in the right-of-divider position e.g. N # E #
  const helpful = tokens
    // helpful tokens are only helpful in the middle of the token list
    // not the beginning or end of the list
    .slice(1, -1)
    .reduce((acc, t) => {
      const helps =
        t.includes(SYMBOLS.DEGREES) || t.includes(SYMBOLS.SECONDS) || SYMBOL_PATTERNS.NSEW.test(t)

      return `${acc}${helps ? 'H' : '_'}`
    }, '')
    .includes('H')
  // 3-5 numbers with no bearings indicators, and no helpful indicators
  const hopeless = /^N{3,5}$/.test(simple) && !helpful

  return pipesResult(tokens, ambiguous || bookends || hopeless)
}
