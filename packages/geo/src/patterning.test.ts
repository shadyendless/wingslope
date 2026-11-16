import { describe, expect, it } from 'vite-plus/test'
import * as Patterning from './patterning'

describe('Patterning', () => {
  it.each`
    method                 | expected
    ${Patterning.capture}  | ${['(abc)', '(abc)']}
    ${Patterning.group}    | ${['(?:abc)', '(?:abc)']}
    ${Patterning.merge}    | ${['abc', 'abc']}
    ${Patterning.optional} | ${['(?:abc)?', '(?:abc)?']}
  `('$method.name', ({ expected, method }) => {
    expect(method(/a/, /b/, /c/).source).toBe(expected[0])
    expect(method(/abc/).source).toBe(expected[1])
  })

  describe('fromTemplate', () => {
    it('should build a regex from parts', () => {
      const parts = {
        alpha: /alpha/,
        beta: /beta/,

        ' ': / /,
      }

      expect(Patterning.fromTemplate(parts, 'beta alpha').toString()).toBe(
        /^beta alpha$/.toString(),
      )

      expect(Patterning.fromTemplate(parts, 'alpha beta missing').toString()).toBe(
        /^alpha beta _MISS_missing_MISS_$/.toString(),
      )
    })
  })
})
