import './__fixtures__/dnd-env'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, type Component } from 'vue'
import { settle } from './__fixtures__/dnd-env'
import {
  clampTreeDrop,
  describeTreeMove,
  getTreeDropDepths,
  getTreeDropGap,
  getTreeDropIndicator,
  getTreeDropMove,
  getTreeDropParent,
  getVisibleTreeRows,
  isTreeDropOrigin,
  startTreeDrag,
  stepTreeDrop,
  type TreeDrag,
} from './drag-and-drop'
import GsTree from './GsTree.vue'
import type { GsTreeKey, GsTreeMove, GsTreeNode } from './types'
import { useTree } from './use-tree'

/**
 * documents
 *   work
 *     report
 *     slides
 *   personal
 *     photo
 *     locked (disabled)
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

const allExpanded = new Set(['documents', 'work', 'personal', 'downloads'])
const visible = () => getVisibleTreeRows(files(), allExpanded)
const drag = (key: GsTreeKey) => startTreeDrag(visible(), key)!
const keys = (d: TreeDrag) => d.rows.map((row) => row.key)

describe('tree drop projection', () => {
  it('flattens the visible rows in display order, with their depth', () => {
    expect(getVisibleTreeRows(files(), new Set(['documents']))).toEqual([
      { key: 'documents', depth: 0 },
      { key: 'work', depth: 1 },
      { key: 'personal', depth: 1 },
      { key: 'downloads', depth: 0 },
    ])
  })

  it('takes the dragged node and its descendants out of the drop rows', () => {
    const work = drag('work')
    expect(keys(work)).toEqual([
      'documents',
      'personal',
      'photo',
      'locked',
      'downloads',
      'installer',
    ])
    expect(work.descendants).toEqual(['report', 'slides'])
    expect(work.origin).toEqual({ gap: 1, depth: 1 })
    expect(startTreeDrag(visible(), 'missing')).toBeUndefined()
  })

  it('allows depths from the next row to one below the previous row', () => {
    const report = drag('report') // documents, work, slides, personal, …
    // Between work and slides: only as work's child, or slides would lose its parent.
    expect(getTreeDropDepths(report.rows, 2)).toEqual({ min: 2, max: 2 })
    // After slides: into slides, next to it, or next to work.
    expect(getTreeDropDepths(report.rows, 3)).toEqual({ min: 1, max: 3 })
    // Before the first row and after the last one.
    expect(getTreeDropDepths(report.rows, 0)).toEqual({ min: 0, max: 0 })
    expect(getTreeDropDepths(report.rows, report.rows.length)).toEqual({ min: 0, max: 2 })
    expect(clampTreeDrop(report.rows, 3, 9)).toEqual({ gap: 3, depth: 3 })
    expect(clampTreeDrop(report.rows, -4, 2)).toEqual({ gap: 0, depth: 0 })
  })

  it('maps a projection to a move before, after or into a node', () => {
    const report = drag('report')
    const move = (gap: number, depth: number) => getTreeDropMove(report, { gap, depth })
    const to = (target: GsTreeKey | null, position: GsTreeMove['position']) => ({
      keys: ['report'],
      target,
      position,
    })
    expect(move(0, 0)).toEqual(to('documents', 'before'))
    expect(move(3, 3)).toEqual(to('slides', 'into'))
    expect(move(3, 2)).toEqual(to('slides', 'after'))
    expect(move(3, 1)).toEqual(to('work', 'after'))
    expect(move(6, 0)).toEqual(to('documents', 'after'))
    expect(move(8, 0)).toEqual(to('downloads', 'after'))
    expect(move(8, 2)).toEqual(to('installer', 'into'))

    const only = startTreeDrag([{ key: 'solo', depth: 0 }], 'solo')!
    expect(getTreeDropMove(only, { gap: 0, depth: 0 })).toEqual({
      keys: ['solo'],
      target: null,
      position: 'into',
    })
  })

  it('knows the origin, the new parent and where to draw the line', () => {
    const slides = drag('slides') // documents, work, report, personal, …
    expect(isTreeDropOrigin(slides, slides.origin)).toBe(true)
    expect(getTreeDropIndicator(slides, slides.origin)).toEqual({ key: 'slides', edge: 'top' })
    expect(isTreeDropOrigin(slides, { gap: 3, depth: 1 })).toBe(false)

    expect(getTreeDropParent(slides, { gap: 2, depth: 2 })).toBe('work')
    expect(getTreeDropIndicator(slides, { gap: 2, depth: 2 })).toEqual({
      key: 'report',
      edge: 'top',
    })
    expect(getTreeDropParent(slides, { gap: 0, depth: 0 })).toBeNull()

    const end = { gap: slides.rows.length, depth: 0 }
    expect(getTreeDropIndicator(slides, end)).toEqual({ key: 'installer', edge: 'bottom' })
  })

  it('finds the gap under the pointer from the rows’ centers', () => {
    expect(getTreeDropGap([10, 30, 50], 5)).toBe(0)
    expect(getTreeDropGap([10, 30, 50], 31)).toBe(2)
    expect(getTreeDropGap([10, 30, 50], 70)).toBe(3)
  })

  it('steps through gaps and depths with the arrow keys, keeping the chosen depth', () => {
    const report = drag('report')
    // Right at the origin is capped (it can't go into work's next child from there).
    let step = stepTreeDrop(report, report.origin, 2, 'right')
    expect(step).toEqual({ projection: { gap: 2, depth: 2 }, preferredDepth: 2 })
    step = stepTreeDrop(report, step.projection, step.preferredDepth, 'down')
    expect(step.projection).toEqual({ gap: 3, depth: 2 })
    step = stepTreeDrop(report, step.projection, step.preferredDepth, 'left')
    expect(step).toEqual({ projection: { gap: 3, depth: 1 }, preferredDepth: 1 })
    // Down past personal's children clamps the depth there, then returns to the chosen one.
    step = stepTreeDrop(report, step.projection, step.preferredDepth, 'down')
    step = stepTreeDrop(report, step.projection, step.preferredDepth, 'down')
    expect(step.projection).toEqual({ gap: 5, depth: 2 })
    step = stepTreeDrop(report, step.projection, step.preferredDepth, 'down')
    expect(step.projection).toEqual({ gap: 6, depth: 1 })
    // Up at the first gap stays put.
    expect(stepTreeDrop(report, { gap: 0, depth: 0 }, 0, 'up').projection).toEqual({
      gap: 0,
      depth: 0,
    })
  })

  it('describes moves with labels', () => {
    const label = (key: GsTreeKey) => key.toUpperCase()
    expect(describeTreeMove({ keys: ['a'], target: 'b', position: 'into' }, label)).toBe('into B')
    expect(describeTreeMove({ keys: ['a'], target: 'b', position: 'after' }, label)).toBe('after B')
    expect(describeTreeMove({ keys: ['a'], target: null, position: 'into' }, label)).toBe(
      'to the start of the tree',
    )
    expect(describeTreeMove({ keys: ['a'], target: null, position: 'after' }, label)).toBe(
      'to the end of the tree',
    )
  })
})

describe('GsTree drag and drop', () => {
  function renderTree(props: Record<string, unknown> = {}) {
    const onMove = vi.fn()
    const Harness = defineComponent({
      setup() {
        const tree = useTree({ items: files(), expanded: [...allExpanded] })
        return () =>
          h(GsTree as Component, {
            items: tree.nodes.value,
            expanded: tree.expanded.value,
            'onUpdate:expanded': (keys: GsTreeKey[]) => (tree.expanded.value = keys),
            modelValue: tree.selected.value,
            'onUpdate:modelValue': (keys: GsTreeKey[]) => (tree.selected.value = keys),
            dragAndDrop: true,
            'aria-label': 'Files',
            onMove: (move: GsTreeMove) => {
              onMove(move)
              tree.applyMove(move)
            },
            ...props,
          })
      },
    })
    const result = render(Harness)
    return { ...result, onMove, user: userEvent.setup() }
  }

  const rowNames = () => screen.getAllByRole('treeitem').map((row) => row.textContent?.trim())
  const row = (name: string) => screen.getByRole('treeitem', { name })
  const handle = (name: string) => screen.getByRole('button', { name: `Drag ${name}` })
  const announcement = () =>
    [...document.querySelectorAll('[id^="dnd-kit-announcement"]')].at(-1)?.textContent

  it('puts a drag handle in each row, described by the keyboard instructions', async () => {
    renderTree()
    await settle()
    const report = handle('Report')
    const description = document.getElementById(report.getAttribute('aria-describedby')!)
    expect(description).toHaveTextContent(/press Space or Enter/)
    expect(handle('Locked')).toBeDisabled()
    // dnd-kit's attributes go on the handle, never on the treeitem.
    expect(report).toHaveAttribute('aria-roledescription', 'draggable')
    expect(row('Report')).not.toHaveAttribute('aria-roledescription')
    expect(row('Report')).toHaveAttribute('role', 'treeitem')
  })

  it('has no handles without drag-and-drop', () => {
    renderTree({ dragAndDrop: false })
    expect(screen.queryByRole('button', { name: /^Drag / })).not.toBeInTheDocument()
  })

  it('moves a row with the keyboard, previewing the drop on the rows', async () => {
    const { user, onMove } = renderTree()
    await settle()
    handle('Slides').focus()
    await user.keyboard(' ')
    await settle()
    expect(announcement()).toBe('Picked up Slides.')
    expect(row('Slides')).toHaveAttribute('data-dragging')
    expect(row('Slides')).toHaveAttribute('data-drop-indicator', 'top')

    await user.keyboard('{ArrowUp}')
    await settle()
    expect(row('Report')).toHaveAttribute('data-drop-indicator', 'top')
    expect(row('Work')).toHaveAttribute('data-drop-target')
    expect(row('Slides')).not.toHaveAttribute('data-drop-indicator')

    await user.keyboard('{Enter}')
    await settle()
    // First in Work: into it.
    expect(onMove).toHaveBeenCalledExactlyOnceWith({
      keys: ['slides'],
      target: 'work',
      position: 'into',
    })
    expect(rowNames().slice(0, 4)).toEqual(['Documents', 'Work', 'Slides', 'Report'])
    expect(announcement()).toBe('Slides moved into Work.')
    // The keys belonged to the drag: nothing was selected, and the handle keeps the focus.
    expect(screen.queryAllByRole('treeitem', { selected: true })).toEqual([])
    expect(handle('Slides')).toHaveFocus()
    expect(row('Report')).not.toHaveAttribute('data-drop-indicator')
  })

  it('changes the level with the left and right arrow keys', async () => {
    const { user, onMove } = renderTree()
    await settle()
    handle('Slides').focus()
    await user.keyboard(' ')
    await settle()
    await user.keyboard('{ArrowLeft}')
    await settle()
    expect(row('Documents')).toHaveAttribute('data-drop-target')
    await user.keyboard(' ')
    await settle()
    expect(onMove).toHaveBeenCalledWith({ keys: ['slides'], target: 'work', position: 'after' })
    const documents = within(screen.getByRole('tree'))
      .getAllByRole('treeitem')
      .filter((item) => item.getAttribute('aria-level') === '2')
      .map((item) => item.textContent?.trim())
    expect(documents).toEqual(['Work', 'Slides', 'Personal', 'Installer'])
  })

  it('cancels with Escape, and drops in place without a move', async () => {
    const { user, onMove } = renderTree()
    await settle()
    handle('Photo').focus()
    await user.keyboard(' ')
    await settle()
    await user.keyboard('{ArrowDown}{Escape}')
    await settle()
    expect(announcement()).toBe('Moving Photo was cancelled.')

    await user.keyboard(' ')
    await settle()
    await user.keyboard(' ')
    await settle()
    expect(announcement()).toBe('Photo was dropped in its original position.')
    expect(onMove).not.toHaveBeenCalled()
  })

  it('keeps Shift+arrows from extending the selection while dragging', async () => {
    const { user } = renderTree()
    await settle()
    handle('Report').focus()
    await user.keyboard(' ')
    await settle()
    await user.keyboard('{Shift>}{ArrowDown}{/Shift}{Escape}')
    await settle()
    expect(screen.queryAllByRole('treeitem', { selected: true })).toEqual([])
  })

  it('focuses the nearest visible ancestor after moving into a collapsed node', async () => {
    const { user, onMove } = renderTree({ expanded: ['documents', 'work', 'personal'] })
    await settle()
    handle('Report').focus()
    await user.keyboard(' ')
    await settle()
    // Down past Personal's children to the end, where the deepest place is in Downloads.
    for (let i = 0; i < 5; i++) await user.keyboard('{ArrowDown}')
    await settle()
    expect(row('Downloads')).toHaveAttribute('data-drop-target')
    await user.keyboard('{Enter}')
    await settle()
    expect(onMove).toHaveBeenCalledWith({ keys: ['report'], target: 'downloads', position: 'into' })
    expect(row('Downloads')).toHaveFocus()
  })
})
