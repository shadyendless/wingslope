import type { RuleType, RuleValidator, ValidationResult } from '@react-querybuilder/vue'

/**
 * Runs a field's validator on a rule and normalizes the result to a `ValidationResult`. A rule
 * without a validator is valid, and a valid result carries no reasons.
 *
 * @example
 * ```ts
 * const rule = { field: 'age', operator: '>', value: 18 }
 * getValidationResult(rule, (r) => Number(r.value) > 0) // { valid: true }
 * ```
 */
export function getValidationResult(rule: RuleType, validator?: RuleValidator): ValidationResult {
  if (!validator) return { valid: true }

  const result = validator(rule)
  if (typeof result === 'boolean') return { valid: result }

  return { valid: result.valid, reasons: result.valid ? [] : result.reasons }
}
