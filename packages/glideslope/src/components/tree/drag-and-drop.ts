/**
 * @internal The drop logic of `GsTree`'s drag-and-drop, kept free of dnd-kit and the DOM so it can
 * be tested directly.
 *
 * A drag works on a projection of the tree's visible rows, flattened in display order, as in
 * dnd-kit's sortable tree example. The dragged node, with its subtree, leaves the list; it can land
 * in any gap between the remaining rows, at any depth from the next row's (it can't take that row
 * away from its parent) to one level below the previous row's (it becomes that row's first child).
 * The pointer picks the gap by height and the depth by how far it has travelled sideways. The arrow
 * keys step through the gaps (up / down) and the depths (left / right). A projection then maps to
 * a `GsTreeMove`: before a root, after a sibling, or into a parent.
 */
import type { GsTreeKey, GsTreeMove, GsTreeNode } from './types'

/** One visible row. */
export interface TreeDropRow {
  key: GsTreeKey
  /** 0 for root nodes. */
  depth: number
}

/** Where a dragged node would land: in the gap before drop row `gap` (or the end), at `depth`. */
export interface TreeDropProjection {
  gap: number
  depth: number
}

/** A drag in progress. */
export interface TreeDrag {
  /** The dragged node. */
  source: GsTreeKey
  /** The visible rows without the source and its descendants: what the source can go between. */
  rows: TreeDropRow[]
  /** The source's visible descendants, which travel with it. */
  descendants: GsTreeKey[]
  /** Where the source is now. Dropping there changes nothing. */
  origin: TreeDropProjection
}

/** A key the arrow keys send while dragging with the keyboard. */
export type TreeDropStep = 'up' | 'down' | 'left' | 'right'

/**
 * The visible rows in display order: every node whose ancestors are all expanded. This is the
 * order Reka UI's tree renders rows in.
 */
export function getVisibleTreeRows<T>(
  nodes: readonly GsTreeNode<T>[],
  expanded: ReadonlySet<GsTreeKey>,
  depth = 0,
  rows: TreeDropRow[] = [],
): TreeDropRow[] {
  for (const node of nodes) {
    rows.push({ key: node.key, depth })
    if (node.children?.length && expanded.has(node.key)) {
      getVisibleTreeRows(node.children, expanded, depth + 1, rows)
    }
  }
  return rows
}

/** Starts dragging a visible row. `undefined` for a key that isn't visible. */
export function startTreeDrag(
  visible: readonly TreeDropRow[],
  source: GsTreeKey,
): TreeDrag | undefined {
  const index = visible.findIndex((row) => row.key === source)
  const row = visible[index]
  if (!row) return undefined
  let end = index + 1
  while ((visible[end]?.depth ?? -1) > row.depth) end++
  return {
    source,
    rows: [...visible.slice(0, index), ...visible.slice(end)],
    descendants: visible.slice(index + 1, end).map(({ key }) => key),
    origin: { gap: index, depth: row.depth },
  }
}

/** The depths a node can take in a gap. */
export function getTreeDropDepths(
  rows: readonly TreeDropRow[],
  gap: number,
): { min: number; max: number } {
  const previous = rows[gap - 1]
  const next = rows[gap]
  return { min: next?.depth ?? 0, max: previous ? previous.depth + 1 : 0 }
}

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

/** The closest valid projection to a gap and depth. */
export function clampTreeDrop(
  rows: readonly TreeDropRow[],
  gap: number,
  depth: number,
): TreeDropProjection {
  const clampedGap = clamp(gap, 0, rows.length)
  const { min, max } = getTreeDropDepths(rows, clampedGap)
  return { gap: clampedGap, depth: clamp(depth, min, max) }
}

/**
 * The gap the pointer is in: before the first row whose vertical center is below it.
 *
 * @param centers The vertical centers of the drop rows, in order.
 */
export function getTreeDropGap(centers: readonly number[], y: number): number {
  const index = centers.findIndex((center) => y < center)
  return index === -1 ? centers.length : index
}

/**
 * Moves a keyboard drag one step. Up and down move to the previous / next gap, keeping the depth
 * the user last chose where the gap allows it. Left and right change the depth.
 *
 * @param preferredDepth The depth the user last chose (the source's own depth until they do).
 */
export function stepTreeDrop(
  drag: TreeDrag,
  current: TreeDropProjection,
  preferredDepth: number,
  step: TreeDropStep,
): { projection: TreeDropProjection; preferredDepth: number } {
  const { rows } = drag
  if (step === 'up' || step === 'down') {
    const gap = current.gap + (step === 'up' ? -1 : 1)
    return { projection: clampTreeDrop(rows, gap, preferredDepth), preferredDepth }
  }
  const projection = clampTreeDrop(rows, current.gap, current.depth + (step === 'left' ? -1 : 1))
  return { projection, preferredDepth: projection.depth }
}

/** Whether a projection is where the source already is. */
export function isTreeDropOrigin(drag: TreeDrag, projection: TreeDropProjection): boolean {
  return projection.gap === drag.origin.gap && projection.depth === drag.origin.depth
}

/** The node a projection puts the source in, or `null` for the root level. */
export function getTreeDropParent(
  drag: TreeDrag,
  projection: TreeDropProjection,
): GsTreeKey | null {
  if (projection.depth === 0) return null
  for (let index = projection.gap - 1; index >= 0; index--) {
    const row = drag.rows[index]
    if (row && row.depth === projection.depth - 1) return row.key
  }
  return null
}

/** The move a projection stands for. */
export function getTreeDropMove(drag: TreeDrag, projection: TreeDropProjection): GsTreeMove {
  const keys = [drag.source]
  const { rows } = drag
  const { gap, depth } = projection
  const previous = rows[gap - 1]
  if (!previous) {
    const first = rows[0]
    return first
      ? { keys, target: first.key, position: 'before' }
      : { keys, target: null, position: 'into' }
  }
  if (depth > previous.depth) return { keys, target: previous.key, position: 'into' }
  // The nearest earlier row at the same depth is the previous sibling: rows in between are its
  // descendants, since depth grows one level at a time.
  for (let index = gap - 1; index >= 0; index--) {
    const row = rows[index]
    if (row && row.depth === depth) return { keys, target: row.key, position: 'after' }
  }
  return { keys, target: null, position: 'after' }
}

/**
 * The row that shows the drop indicator, and on which edge. At the origin it is the source's own
 * row, so the line sits where the source is rather than past its descendants.
 */
export function getTreeDropIndicator(
  drag: TreeDrag,
  projection: TreeDropProjection,
): { key: GsTreeKey; edge: 'top' | 'bottom' } | undefined {
  if (projection.gap === drag.origin.gap) return { key: drag.source, edge: 'top' }
  const next = drag.rows[projection.gap]
  if (next) return { key: next.key, edge: 'top' }
  const previous = drag.rows[projection.gap - 1]
  return previous && { key: previous.key, edge: 'bottom' }
}

/** Where a move puts its nodes, in words: "into Work", "after Report", "to the end of the tree". */
export function describeTreeMove(move: GsTreeMove, label: (key: GsTreeKey) => string): string {
  if (move.target === null) {
    return move.position === 'after' ? 'to the end of the tree' : 'to the start of the tree'
  }
  return `${move.position} ${label(move.target)}`
}
