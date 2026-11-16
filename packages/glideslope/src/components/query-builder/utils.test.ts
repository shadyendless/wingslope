import type { RuleType } from '@react-querybuilder/vue'
import { describe, expect, it } from 'vitest'
import { getValidationResult } from './utils'

/** Whether a value coerces to an integer no greater than 10. */
const isSmallInt = (value: unknown) => {
  const number = Number(value)
  return Number.isInteger(number) && number <= 10
}

/** Whether a value is a non-empty string. */
const isFilled = (value: unknown) => typeof value === 'string' && value.length > 0

/** Accepts one value, or a `[start, end]` pair, when `check` accepts each. */
const singleOrPair = (check: (value: unknown) => boolean) => (value: unknown) =>
  check(value) || (Array.isArray(value) && value.length === 2 && value.every(check))

describe('queryBuilder/utils', () => {
  describe('getValidationResult', () => {
    const baseRule = {
      field: 'TEST_FIELD',
      id: '123abc',
      operator: 'equals',
      value: '100',
    }

    const numValidatorMultiValue = (r: RuleType) => ({
      valid: singleOrPair(isSmallInt)(r.value),
      reasons: ['Number must be in range.'],
    })

    it('should return valid if no validator provided', () => {
      const result = getValidationResult(baseRule)

      expect(result.valid).toBe(true)
      expect(result.reasons).toBeUndefined()
    })

    it('should return valid if validator passes', () => {
      const result = getValidationResult({ ...baseRule, value: 'foo' }, (r: RuleType) => ({
        valid: isFilled(r.value),
        reasons: ['At least one character is required.'],
      }))

      expect(result.valid).toBe(true)
      expect(result.reasons?.length).toEqual(0)
    })

    it('should return invalid if validator fails', () => {
      const result = getValidationResult({ ...baseRule, value: '' }, (r: RuleType) => ({
        valid: isFilled(r.value),
        reasons: ['At least one character is required.'],
      }))

      expect(result.valid).toBe(false)
      expect(result.reasons?.length).toEqual(1)
      expect(result.reasons).toStrictEqual(['At least one character is required.'])
    })

    it('should normalize a boolean validator result', () => {
      expect(getValidationResult(baseRule, () => false)).toStrictEqual({ valid: false })
      expect(getValidationResult(baseRule, () => true)).toStrictEqual({ valid: true })
    })

    it('multi-value validation fails if one value fails', () => {
      const rule = { ...baseRule, operator: 'between', value: ['1', '15'] }

      const result = getValidationResult(rule, numValidatorMultiValue)

      expect(result.valid).toBe(false)
      expect(result.reasons).toStrictEqual(['Number must be in range.'])
    })

    it('multi-value validation fails if both values fail', () => {
      const rule = { ...baseRule, operator: 'between', value: ['15', '15'] }

      const result = getValidationResult(rule, numValidatorMultiValue)

      expect(result.valid).toBe(false)
      expect(result.reasons).toStrictEqual(['Number must be in range.'])
    })

    it('multi-value passes if both values pass', () => {
      const rule = { ...baseRule, operator: 'between', value: ['5', '5'] }

      const result = getValidationResult(rule, numValidatorMultiValue)

      expect(result.valid).toBe(true)
      expect(result.reasons?.length).toEqual(0)
    })

    it('multi-value evaluates empty values', () => {
      const result = getValidationResult(
        { ...baseRule, operator: 'between', value: ['foo', ''] },
        (r: RuleType) => ({
          valid: singleOrPair(isFilled)(r.value),
          reasons: ['At least one character is required.'],
        }),
      )

      expect(result.valid).toBe(false)
      expect(result.reasons).toStrictEqual(['At least one character is required.'])
    })
  })
})
