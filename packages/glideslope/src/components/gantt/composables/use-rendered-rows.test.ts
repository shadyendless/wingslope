import { describe, expect, it } from 'vite-plus/test'
import { Comment, createCommentVNode, createTextVNode, Fragment, h } from 'vue'
import { toRows } from './use-rendered-rows'

describe('toRows', () => {
  it('flattens fragments and arrays, and drops comments and whitespace', () => {
    const rows = toRows([
      h('div', { key: 'a' }),
      h(Fragment, [h('div', { key: 'b' }), [h('div', { key: 'c' })]]),
      createCommentVNode('v-if'),
      h(Comment),
      createTextVNode('  '),
      h('div', { key: 'd' }),
    ])

    expect(rows.map((row) => row.key)).toEqual(['a', 'b', 'c', 'd'])
  })
})
