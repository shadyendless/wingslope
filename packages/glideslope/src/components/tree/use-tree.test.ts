import { describe, expect, it } from 'vitest'
import {
  findTreeNode,
  getTreeAncestorKeys,
  getTreeFlaggedKeys,
  getTreeIndeterminateKeys,
  getTreeKeys,
  getTreeLayout,
  getTreeParentKeys,
  getTreeStepMove,
  getTreeViewableKeys,
  insertTreeNodes,
  moveTreeNodes,
  normalizeTreeSelection,
  removeTreeNodes,
  toggleTreeSelection,
  toggleTreeVisibility,
  updateTreeNode,
} from './tree-data'
import type { GsTreeNode } from './types'
import { useTree } from './use-tree'

/**
 * documents
 *   work
 *     report
 *     slides
 *   personal (disabled child: locked)
 *     photo
 *     locked
 * downloads
 *   installer
 */
const files = (): GsTreeNode[] => [
  {
    key: 'documents',
    label: 'Documents',
    children: [
      {
        key: 'work',
        label: 'Work',
        children: [
          { key: 'report', label: 'Report' },
          { key: 'slides', label: 'Slides' },
        ],
      },
      {
        key: 'personal',
        label: 'Personal',
        children: [
          { key: 'photo', label: 'Photo' },
          { key: 'locked', label: 'Locked', disabled: true },
        ],
      },
    ],
  },
  { key: 'downloads', label: 'Downloads', children: [{ key: 'installer', label: 'Installer' }] },
]

/** The tree's shape as nested keys, for readable structural assertions. */
const shape = (nodes: GsTreeNode[]): unknown[] =>
  nodes.map((node) => (node.children?.length ? { [node.key]: shape(node.children) } : node.key))

describe('tree queries', () => {
  it('finds nodes, keys, parents and ancestors', () => {
    const tree = files()
    expect(findTreeNode(tree, 'slides')?.label).toBe('Slides')
    expect(findTreeNode(tree, 'missing')).toBeUndefined()
    expect(getTreeKeys(tree)).toEqual([
      'documents',
      'work',
      'report',
      'slides',
      'personal',
      'photo',
      'locked',
      'downloads',
      'installer',
    ])
    expect(getTreeParentKeys(tree)).toEqual(['documents', 'work', 'personal', 'downloads'])
    expect(getTreeAncestorKeys(tree, 'slides')).toEqual(['documents', 'work'])
    expect(getTreeAncestorKeys(tree, 'documents')).toEqual([])
  })

  it('records sibling positions for rule lines', () => {
    const layout = getTreeLayout(files())
    expect(layout.get('report')).toEqual({ last: false, ancestorsLast: [false, false] })
    expect(layout.get('locked')).toEqual({ last: true, ancestorsLast: [false, true] })
    expect(layout.get('installer')).toEqual({ last: true, ancestorsLast: [true] })
  })
})

describe('tree structure helpers', () => {
  it('inserts before, after and into a target, or at the root level', () => {
    const tree = files()
    const a = { key: 'a', label: 'A' }
    const b = { key: 'b', label: 'B' }
    expect(shape(insertTreeNodes(tree, 'slides', [a, b], 'before'))).toEqual([
      {
        documents: [{ work: ['report', 'a', 'b', 'slides'] }, { personal: ['photo', 'locked'] }],
      },
      { downloads: ['installer'] },
    ])
    expect(shape(insertTreeNodes(tree, 'downloads', [a], 'after'))).toEqual([
      expect.anything(),
      { downloads: ['installer'] },
      'a',
    ])
    expect(shape(insertTreeNodes(tree, 'downloads', [a, b], 'into'))).toEqual([
      expect.anything(),
      { downloads: ['a', 'b', 'installer'] },
    ])
    expect(shape(insertTreeNodes(tree, null, [a], 'before'))[0]).toBe('a')
    expect(shape(insertTreeNodes(tree, null, [a], 'after'))[2]).toBe('a')
  })

  it('leaves the input untouched and shares unchanged subtrees', () => {
    const tree = files()
    const next = insertTreeNodes(tree, 'installer', [{ key: 'a', label: 'A' }], 'after')
    expect(getTreeKeys(tree)).not.toContain('a')
    expect(next[0]).toBe(tree[0])
    expect(insertTreeNodes(tree, 'missing', [{ key: 'a', label: 'A' }], 'after')).toBe(tree)
  })

  it('removes nodes with their descendants', () => {
    const next = removeTreeNodes(files(), ['work', 'installer'])
    expect(shape(next)).toEqual([{ documents: [{ personal: ['photo', 'locked'] }] }, 'downloads'])
  })

  it('updates a node', () => {
    const next = updateTreeNode(files(), 'photo', (node) => ({ ...node, label: 'Picture' }))
    expect(findTreeNode(next, 'photo')?.label).toBe('Picture')
  })

  it('moves nodes, in order, with their subtrees', () => {
    const tree = files()
    expect(shape(moveTreeNodes(tree, ['slides', 'report'], 'downloads', 'into'))).toEqual([
      { documents: ['work', { personal: ['photo', 'locked'] }] },
      { downloads: ['slides', 'report', 'installer'] },
    ])
    expect(shape(moveTreeNodes(tree, ['work'], 'downloads', 'after'))).toEqual([
      { documents: [{ personal: ['photo', 'locked'] }] },
      { downloads: ['installer'] },
      { work: ['report', 'slides'] },
    ])
    expect(shape(moveTreeNodes(tree, ['installer'], 'documents', 'before'))[0]).toBe('installer')
  })

  it('refuses to move a node into its own subtree', () => {
    const tree = files()
    expect(moveTreeNodes(tree, ['documents'], 'report', 'into')).toBe(tree)
    expect(moveTreeNodes(tree, ['documents'], 'documents', 'after')).toBe(tree)
  })
})

describe('step moves', () => {
  const step = (key: string, direction: Parameters<typeof getTreeStepMove>[2]) =>
    getTreeStepMove(files(), key, direction)

  it('moves past the previous or next sibling', () => {
    expect(step('slides', 'up')).toEqual({ keys: ['slides'], target: 'report', position: 'before' })
    expect(step('report', 'down')).toEqual({
      keys: ['report'],
      target: 'slides',
      position: 'after',
    })
    expect(step('downloads', 'up')).toEqual({
      keys: ['downloads'],
      target: 'documents',
      position: 'before',
    })
  })

  it('indents into the previous sibling as its last child, or its only one', () => {
    expect(step('personal', 'indent')).toEqual({
      keys: ['personal'],
      target: 'slides',
      position: 'after',
    })
    expect(step('slides', 'indent')).toEqual({
      keys: ['slides'],
      target: 'report',
      position: 'into',
    })
  })

  it('outdents to right after the parent', () => {
    expect(step('photo', 'outdent')).toEqual({
      keys: ['photo'],
      target: 'personal',
      position: 'after',
    })
  })

  it("returns undefined where a node can't go", () => {
    expect(step('report', 'up')).toBeUndefined()
    expect(step('slides', 'down')).toBeUndefined()
    expect(step('documents', 'indent')).toBeUndefined()
    expect(step('documents', 'outdent')).toBeUndefined()
    expect(step('missing', 'down')).toBeUndefined()
  })

  it('applies with moveTreeNodes', () => {
    const tree = files()
    const { keys, target, position } = getTreeStepMove(tree, 'personal', 'indent')!
    expect(shape(moveTreeNodes(tree, keys, target, position))[0]).toEqual({
      documents: [{ work: ['report', 'slides', { personal: ['photo', 'locked'] }] }],
    })
  })
})

describe('selection', () => {
  it('toggles one key in multiple mode without cascade', () => {
    const tree = files()
    expect(toggleTreeSelection(tree, [], 'work')).toEqual(['work'])
    expect(toggleTreeSelection(tree, ['work', 'photo'], 'work')).toEqual(['photo'])
    expect(getTreeIndeterminateKeys(tree, ['report'])).toEqual(new Set(['work', 'documents']))
  })

  it('replaces or clears the selection in single mode, and ignores none', () => {
    const tree = files()
    expect(toggleTreeSelection(tree, ['work'], 'photo', { mode: 'single' })).toEqual(['photo'])
    expect(toggleTreeSelection(tree, ['photo'], 'photo', { mode: 'single' })).toEqual([])
    expect(toggleTreeSelection(tree, ['work'], 'photo', { mode: 'none' })).toEqual(['work'])
  })

  it('ignores disabled and unknown keys', () => {
    const tree = files()
    expect(toggleTreeSelection(tree, [], 'locked')).toEqual([])
    expect(toggleTreeSelection(tree, [], 'photo', { disabledKeys: ['photo'] })).toEqual([])
    expect(toggleTreeSelection(tree, [], 'missing')).toEqual([])
  })

  describe('with cascade', () => {
    const cascade = { cascade: true }

    it('selects and deselects a parent with all its descendants', () => {
      const tree = files()
      const selected = toggleTreeSelection(tree, [], 'work', cascade)
      expect(selected).toEqual(['work', 'report', 'slides'])
      expect(getTreeIndeterminateKeys(tree, selected)).toEqual(new Set(['documents']))
      expect(toggleTreeSelection(tree, selected, 'work', cascade)).toEqual([])
    })

    it('skips disabled descendants and treats the parent as fully selected without them', () => {
      const tree = files()
      const selected = toggleTreeSelection(tree, [], 'personal', cascade)
      expect(selected).toEqual(['personal', 'photo'])
      expect(getTreeIndeterminateKeys(tree, selected).has('personal')).toBe(false)
    })

    it('bubbles partial selection up as indeterminate, through every level', () => {
      const tree = files()
      const selected = toggleTreeSelection(tree, [], 'report', cascade)
      expect(selected).toEqual(['report'])
      expect(getTreeIndeterminateKeys(tree, selected)).toEqual(new Set(['work', 'documents']))
    })

    it('selects a parent once all its enabled children are selected', () => {
      const tree = files()
      let selected = toggleTreeSelection(tree, [], 'report', cascade)
      selected = toggleTreeSelection(tree, selected, 'slides', cascade)
      expect(selected).toEqual(['work', 'report', 'slides'])
      selected = toggleTreeSelection(tree, selected, 'photo', cascade)
      expect(selected).toEqual(['documents', 'work', 'report', 'slides', 'personal', 'photo'])
      expect(getTreeIndeterminateKeys(tree, selected).size).toBe(0)
    })

    it('selects a partially selected parent completely', () => {
      const tree = files()
      const selected = toggleTreeSelection(tree, ['report'], 'documents', cascade)
      expect(selected).toEqual(['documents', 'work', 'report', 'slides', 'personal', 'photo'])
    })

    it('normalizes parents after a structural change', () => {
      const tree = moveTreeNodes(files(), ['report'], 'downloads', 'into')
      expect(normalizeTreeSelection(tree, ['work', 'report', 'slides'])).toEqual([
        'work',
        'slides',
        'report',
      ])
      expect(getTreeIndeterminateKeys(tree, ['work', 'slides', 'report'])).toEqual(
        new Set(['documents', 'downloads']),
      )
    })
  })
})

describe('visibility', () => {
  it('toggles a single flag without touching descendants', () => {
    expect(toggleTreeVisibility(['documents', 'work'], 'documents')).toEqual(['work'])
    expect(toggleTreeVisibility(['work'], 'documents')).toEqual(['work', 'documents'])
  })

  it('makes a node viewable only when it and every ancestor are visible', () => {
    const tree = files()
    expect(getTreeViewableKeys(tree, ['documents', 'work', 'report'])).toEqual(
      new Set(['documents', 'work', 'report']),
    )
    // A hidden parent hides its subtree, whatever the children's own flags say.
    expect(getTreeViewableKeys(tree, ['work', 'report'])).toEqual(new Set())
    expect(getTreeViewableKeys(tree, ['documents', 'report'])).toEqual(new Set(['documents']))
  })
})

describe('useTree', () => {
  it('holds state and offers bulk actions', () => {
    const tree = useTree({ items: files(), expanded: ['documents'] })
    tree.expandAll()
    expect(tree.expanded.value).toEqual(['documents', 'work', 'personal', 'downloads'])
    tree.collapseAll()
    expect(tree.expanded.value).toEqual([])

    tree.selectAll()
    expect(tree.selected.value).not.toContain('locked')
    expect(tree.selected.value).toHaveLength(8)
    tree.unselectAll()
    expect(tree.selected.value).toEqual([])

    tree.revealAll()
    expect(tree.visible.value).toHaveLength(9)
    tree.hideAll()
    expect(tree.visible.value).toEqual([])
  })

  it('replaces nodes on structural changes and forgets removed keys', () => {
    const tree = useTree({
      items: files(),
      expanded: ['documents', 'work'],
      selected: ['report'],
      visible: ['work', 'downloads'],
    })
    const before = tree.nodes.value
    tree.remove(['work'])
    expect(tree.nodes.value).not.toBe(before)
    expect(tree.expanded.value).toEqual(['documents'])
    expect(tree.selected.value).toEqual([])
    expect(tree.visible.value).toEqual(['downloads'])

    tree.insertInto('downloads', [{ key: 'readme', label: 'Readme' }])
    tree.updateNode('readme', (node) => ({ ...node, label: 'README' }))
    expect(tree.getNode('readme')?.label).toBe('README')
    tree.moveBefore('documents', ['readme'])
    expect(tree.nodes.value[0]?.key).toBe('readme')
  })

  it('applies moves from the tree and moves nodes a step at a time', () => {
    const tree = useTree({ items: files() })
    tree.applyMove({ keys: ['installer'], target: 'work', position: 'into' })
    expect(shape(tree.nodes.value)[0]).toEqual({
      documents: [{ work: ['installer', 'report', 'slides'] }, { personal: ['photo', 'locked'] }],
    })
    tree.applyMove({ keys: ['downloads'], target: null, position: 'into' })
    expect(tree.nodes.value[0]?.key).toBe('downloads')

    expect(tree.canMoveStep('installer', 'up')).toBe(false)
    expect(tree.canMoveStep('installer', 'down')).toBe(true)
    tree.moveStep('installer', 'down')
    tree.moveStep('installer', 'outdent')
    expect(shape(tree.nodes.value)).toEqual([
      'downloads',
      {
        documents: [{ work: ['report', 'slides'] }, 'installer', { personal: ['photo', 'locked'] }],
      },
    ])
    // Impossible steps change nothing.
    const before = tree.nodes.value
    tree.moveStep('downloads', 'up')
    expect(tree.nodes.value).toBe(before)
  })

  it('keeps a cascading selection consistent when nodes move', () => {
    const tree = useTree({
      items: files(),
      selected: ['documents', 'work', 'report', 'slides', 'personal', 'photo'],
      selectionCascade: true,
    })
    // An unselected node joins a fully selected folder: the folder and its parent turn partial.
    tree.moveInto('work', ['installer'])
    expect(tree.selected.value).toEqual(['report', 'slides', 'personal', 'photo'])
    expect(getTreeIndeterminateKeys(tree.nodes.value, tree.selected.value)).toEqual(
      new Set(['documents', 'work']),
    )

    // A selected node joins a folder of unselected nodes: that folder turns partial too.
    tree.insertInto('downloads', [{ key: 'readme', label: 'Readme' }])
    tree.moveInto('downloads', ['photo'])
    expect(getTreeIndeterminateKeys(tree.nodes.value, tree.selected.value)).toEqual(
      new Set(['documents', 'work', 'downloads']),
    )
  })
})

describe('initial state flags', () => {
  const flagged = (): GsTreeNode[] => [
    {
      key: 'documents',
      label: 'Documents',
      expanded: true,
      visible: true,
      children: [
        { key: 'report', label: 'Report', selected: true, visible: true },
        { key: 'slides', label: 'Slides', selected: false },
      ],
    },
    { key: 'downloads', label: 'Downloads', selected: true, children: [] },
  ]

  it('lists the keys of flagged nodes in tree order', () => {
    expect(getTreeFlaggedKeys(flagged(), 'expanded')).toEqual(['documents'])
    expect(getTreeFlaggedKeys(flagged(), 'selected')).toEqual(['report', 'downloads'])
    expect(getTreeFlaggedKeys(flagged(), 'visible')).toEqual(['documents', 'report'])
  })

  it('start useTree state', () => {
    const tree = useTree({ items: flagged() })
    expect(tree.expanded.value).toEqual(['documents'])
    expect(tree.selected.value).toEqual(['report', 'downloads'])
    expect(tree.visible.value).toEqual(['documents', 'report'])
  })

  it('lose to the keys passed to useTree', () => {
    const tree = useTree({ items: flagged(), expanded: [], selected: ['slides'] })
    expect(tree.expanded.value).toEqual([])
    expect(tree.selected.value).toEqual(['slides'])
    expect(tree.visible.value).toEqual(['documents', 'report'])
  })
})
