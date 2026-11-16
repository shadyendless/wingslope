import type { Tokens } from '../lexer'

/**
 * Create a simplified pattern string - numbers = 'N', bearings = 'B' - to
 * allow for simpler pattern matching.
 *
 * @param tokens - Array of coordinate tokens to simplify.
 * @returns Simplified pattern string where 'N' = number and 'B' = bearing.
 *
 * @example
 * ```typescript
 * simpler(['45', '30', 'N', '/', '122', '15', 'W']);
 * // 'NNBNNNB'
 * ```
 *
 * @example
 * ```typescript
 * simpler(['45', 'N']);
 * // 'NB'
 * ```
 *
 * @remarks
 * pure function
 */
export const simpler = (tokens: Tokens) => tokens.map((t) => (/\d/.test(t) ? 'N' : 'B')).join('')
