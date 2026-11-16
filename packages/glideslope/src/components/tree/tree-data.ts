/**
 * Pure, immutable helpers for tree data and tree state (selection, visibility). Every function
 * returns new arrays and leaves untouched subtrees shared, so results can go straight into a
 * `shallowRef`. `useTree` wraps them with reactive state.
 */
import type {
  GsTreeInsertPosition,
  GsTreeKey,
  GsTreeMove,
  GsTreeMoveDirection,
  GsTreeNode,
  GsTreeSelectionMode,
  GsTreeStateFlag,
} from './types'

type Nodes<T> = readonly GsTreeNode<T>[]

/**
 * Visits every node depth-first, parents before children.
 *
 * @param visit Called with the node and its ancestors (root first).
 */
export function walkTree<T>(
  nodes: Nodes<T>,
  visit: (node: GsTreeNode<T>, ancestors: readonly GsTreeNode<T>[]) => void,
  ancestors: readonly GsTreeNode<T>[] = [],
): void {
  for (const node of nodes) {
    visit(node, ancestors)
    if (node.children) walkTree(node.children, visit, [...ancestors, node])
  }
}

/** Finds a node by key anywhere in the tree. */
export function findTreeNode<T>(nodes: Nodes<T>, key: GsTreeKey): GsTreeNode<T> | undefined {
  for (const node of nodes) {
    if (node.key === key) return node
    const found = node.children && findTreeNode(node.children, key)
    if (found) return found
  }
  return undefined
}

/** Keys of every node (or those matching `filter`), in depth-first order. */
export function getTreeKeys<T>(
  nodes: Nodes<T>,
  filter?: (node: GsTreeNode<T>) => boolean,
): GsTreeKey[] {
  const keys: GsTreeKey[] = []
  walkTree(nodes, (node) => {
    if (!filter || filter(node)) keys.push(node.key)
  })
  return keys
}

/**
 * Keys of nodes whose `expanded`, `selected` or `visible` flag is set: the initial state a tree's
 * data describes.
 */
export function getTreeFlaggedKeys<T>(nodes: Nodes<T>, flag: GsTreeStateFlag): GsTreeKey[] {
  return getTreeKeys(nodes, (node) => !!node[flag])
}

/** Keys of every node with children: what "expand all" expands. */
export function getTreeParentKeys<T>(nodes: Nodes<T>): GsTreeKey[] {
  return getTreeKeys(nodes, (node) => !!node.children?.length)
}

/** Keys of a node's ancestors, root first. Empty for root nodes and unknown keys. */
export function getTreeAncestorKeys<T>(nodes: Nodes<T>, key: GsTreeKey): GsTreeKey[] {
  for (const node of nodes) {
    if (node.key === key) return []
    if (!node.children) continue
    if (findTreeNode(node.children, key)) {
      return [node.key, ...getTreeAncestorKeys(node.children, key)]
    }
  }
  return []
}

/** Keys of nodes disabled by their own flag or by `disabledKeys`. */
export function getTreeDisabledKeys<T>(
  nodes: Nodes<T>,
  disabledKeys: Iterable<GsTreeKey> = [],
): Set<GsTreeKey> {
  return new Set([...disabledKeys, ...getTreeKeys(nodes, (node) => !!node.disabled)])
}

/* ---------------------------------------------------------------------------------------------- */
/* Structure                                                                                       */
/* ---------------------------------------------------------------------------------------------- */

/** Replaces one node with the result of `update`. Returns `nodes` unchanged if the key is absent. */
export function updateTreeNode<T>(
  nodes: Nodes<T>,
  key: GsTreeKey,
  update: (node: GsTreeNode<T>) => GsTreeNode<T>,
): GsTreeNode<T>[] {
  let changed = false
  const next = nodes.map((node) => {
    if (changed) return node
    if (node.key === key) {
      changed = true
      return update(node)
    }
    if (!node.children) return node
    const children = updateTreeNode(node.children, key, update)
    if (children === node.children) return node
    changed = true
    return { ...node, children }
  })
  return changed ? next : (nodes as GsTreeNode<T>[])
}

/** Removes nodes, with their descendants. Unknown keys are ignored. */
export function removeTreeNodes<T>(nodes: Nodes<T>, keys: Iterable<GsTreeKey>): GsTreeNode<T>[] {
  const remove = new Set(keys)
  const prune = (list: Nodes<T>): GsTreeNode<T>[] => {
    let changed = false
    const next: GsTreeNode<T>[] = []
    for (const node of list) {
      if (remove.has(node.key)) {
        changed = true
        continue
      }
      const children = node.children && prune(node.children)
      if (children !== node.children) {
        changed = true
        next.push({ ...node, children })
      } else {
        next.push(node)
      }
    }
    return changed ? next : (list as GsTreeNode<T>[])
  }
  return prune(nodes)
}

/**
 * Inserts nodes, in order, relative to `target`:
 * - `before` / `after`: as siblings of the target
 * - `into`: as the target's first children
 *
 * A `null` target means the root level: `before` and `into` insert at the start, `after` at the
 * end. An unknown target leaves the tree unchanged.
 */
export function insertTreeNodes<T>(
  nodes: Nodes<T>,
  target: GsTreeKey | null,
  inserted: Nodes<T>,
  position: GsTreeInsertPosition,
): GsTreeNode<T>[] {
  if (target === null) {
    return position === 'after' ? [...nodes, ...inserted] : [...inserted, ...nodes]
  }
  if (position === 'into') {
    return updateTreeNode(nodes, target, (node) => ({
      ...node,
      children: [...inserted, ...(node.children ?? [])],
    }))
  }
  const place = (list: Nodes<T>): GsTreeNode<T>[] | undefined => {
    const index = list.findIndex((node) => node.key === target)
    if (index !== -1) {
      const at = position === 'before' ? index : index + 1
      return [...list.slice(0, at), ...inserted, ...list.slice(at)]
    }
    for (const [i, node] of list.entries()) {
      const children = node.children && place(node.children)
      if (children) return list.map((n, j) => (j === i ? { ...node, children } : n))
    }
    return undefined
  }
  return place(nodes) ?? (nodes as GsTreeNode<T>[])
}

/**
 * Moves nodes (with their descendants), in the given order, relative to `target` (see
 * `insertTreeNodes`). Keys nested inside another moved node travel with it. Moving a node onto
 * itself or into its own subtree leaves the tree unchanged.
 */
export function moveTreeNodes<T>(
  nodes: Nodes<T>,
  keys: Iterable<GsTreeKey>,
  target: GsTreeKey | null,
  position: GsTreeInsertPosition,
): GsTreeNode<T>[] {
  const requested = new Set(keys)
  const moved: GsTreeNode<T>[] = []
  for (const key of requested) {
    const node = findTreeNode(nodes, key)
    if (!node) continue
    const nested = getTreeAncestorKeys(nodes, key).some((ancestor) => requested.has(ancestor))
    if (!nested) moved.push(node)
  }
  if (moved.length === 0) return nodes as GsTreeNode<T>[]
  if (target !== null && moved.some((node) => findTreeNode([node], target))) {
    return nodes as GsTreeNode<T>[]
  }
  const without = removeTreeNodes(
    nodes,
    moved.map((node) => node.key),
  )
  return insertTreeNodes(without, target, moved, position)
}

/** The siblings of a node (its parent's children, or the root level), and its index among them. */
function findTreeSiblings<T>(
  nodes: Nodes<T>,
  key: GsTreeKey,
  parent: GsTreeNode<T> | null = null,
): { siblings: Nodes<T>; index: number; parent: GsTreeNode<T> | null } | undefined {
  const index = nodes.findIndex((node) => node.key === key)
  if (index !== -1) return { siblings: nodes, index, parent }
  for (const node of nodes) {
    const found = node.children && findTreeSiblings(node.children, key, node)
    if (found) return found
  }
  return undefined
}

/**
 * Where one step in `direction` takes a node, as a move for `moveTreeNodes` (or `useTree`'s
 * `applyMove`): the non-drag alternative to dragging, for "Move up" or "Indent" buttons and menu
 * items.
 *
 * - `up` / `down`: before its previous sibling / after its next sibling
 * - `indent`: into its previous sibling, as the last child
 * - `outdent`: out of its parent, right after it
 *
 * Returns `undefined` when the node can't go that way (it is the first or last sibling, a root
 * node for `outdent`, or an unknown key).
 */
export function getTreeStepMove<T>(
  nodes: Nodes<T>,
  key: GsTreeKey,
  direction: GsTreeMoveDirection,
): GsTreeMove | undefined {
  const found = findTreeSiblings(nodes, key)
  if (!found) return undefined
  const { siblings, index, parent } = found
  const previous = siblings[index - 1]
  const next = siblings[index + 1]
  const keys = [key]
  switch (direction) {
    case 'up':
      return previous && { keys, target: previous.key, position: 'before' }
    case 'down':
      return next && { keys, target: next.key, position: 'after' }
    case 'indent': {
      if (!previous) return undefined
      const last = previous.children?.at(-1)
      return last
        ? { keys, target: last.key, position: 'after' }
        : { keys, target: previous.key, position: 'into' }
    }
    case 'outdent':
      return parent ? { keys, target: parent.key, position: 'after' } : undefined
  }
}

/* ---------------------------------------------------------------------------------------------- */
/* Selection                                                                                       */
/* ---------------------------------------------------------------------------------------------- */

export interface GsTreeSelectionOptions {
  /** @default 'multiple' */
  mode?: GsTreeSelectionMode
  /** Cascade selection through descendants and up to ancestors (`multiple` only). */
  cascade?: boolean
  /** Extra disabled keys, on top of nodes with `disabled: true`. */
  disabledKeys?: Iterable<GsTreeKey>
}

interface CascadeState {
  selected: Set<GsTreeKey>
  indeterminate: Set<GsTreeKey>
}

/**
 * Derives each parent's state from its enabled children, bottom-up: selected when all are
 * selected, indeterminate when some are (or any is indeterminate), unselected otherwise. Leaves and
 * parents whose children are all disabled keep their own state.
 */
function resolveCascade<T>(
  nodes: Nodes<T>,
  selected: Iterable<GsTreeKey>,
  disabled: ReadonlySet<GsTreeKey>,
): CascadeState {
  const state: CascadeState = { selected: new Set(selected), indeterminate: new Set() }
  const visit = (node: GsTreeNode<T>) => {
    const children = node.children ?? []
    children.forEach(visit)
    const enabled = children.filter((child) => !disabled.has(child.key))
    if (enabled.length === 0) return
    const partial = enabled.some((child) => state.indeterminate.has(child.key))
    const count = enabled.filter((child) => state.selected.has(child.key)).length
    if (!partial && count === enabled.length) {
      state.selected.add(node.key)
    } else {
      state.selected.delete(node.key)
      if (partial || count > 0) state.indeterminate.add(node.key)
    }
  }
  nodes.forEach(visit)
  return state
}

/**
 * Makes a cascading selection consistent: parents follow their enabled children. Returns keys in
 * tree order; keys not in the tree are dropped.
 */
export function normalizeTreeSelection<T>(
  nodes: Nodes<T>,
  selected: Iterable<GsTreeKey>,
  disabledKeys?: Iterable<GsTreeKey>,
): GsTreeKey[] {
  const { selected: set } = resolveCascade(
    nodes,
    selected,
    getTreeDisabledKeys(nodes, disabledKeys),
  )
  return getTreeKeys(nodes, (node) => set.has(node.key))
}

/** Parents with some, but not all, enabled descendants selected (cascading selection). */
export function getTreeIndeterminateKeys<T>(
  nodes: Nodes<T>,
  selected: Iterable<GsTreeKey>,
  disabledKeys?: Iterable<GsTreeKey>,
): Set<GsTreeKey> {
  return resolveCascade(nodes, selected, getTreeDisabledKeys(nodes, disabledKeys)).indeterminate
}

/**
 * Toggles one node's selection and returns the new selected keys.
 *
 * - `none`: nothing changes.
 * - `single`: the node replaces the selection, or clears it if it was selected.
 * - `multiple`: the node is added or removed. With `cascade`, its enabled descendants follow and
 *   its ancestors are re-derived (see `normalizeTreeSelection`).
 *
 * Disabled and unknown keys leave the selection unchanged.
 */
export function toggleTreeSelection<T>(
  nodes: Nodes<T>,
  selected: readonly GsTreeKey[],
  key: GsTreeKey,
  { mode = 'multiple', cascade = false, disabledKeys }: GsTreeSelectionOptions = {},
): GsTreeKey[] {
  const node = findTreeNode(nodes, key)
  const disabled = getTreeDisabledKeys(nodes, disabledKeys)
  if (mode === 'none' || !node || disabled.has(key)) return [...selected]

  const isSelected = selected.includes(key)
  if (mode === 'single') return isSelected ? [] : [key]
  if (!cascade) return isSelected ? selected.filter((k) => k !== key) : [...selected, key]

  const next = new Set(selected)
  walkTree([node], (descendant) => {
    if (disabled.has(descendant.key)) return
    if (isSelected) next.delete(descendant.key)
    else next.add(descendant.key)
  })
  const { selected: resolved } = resolveCascade(nodes, next, disabled)
  return getTreeKeys(nodes, (n) => resolved.has(n.key))
}

/* ---------------------------------------------------------------------------------------------- */
/* Visibility                                                                                      */
/* ---------------------------------------------------------------------------------------------- */

/** Flips one node's own visibility flag. Descendants keep their flags. */
export function toggleTreeVisibility(visible: readonly GsTreeKey[], key: GsTreeKey): GsTreeKey[] {
  return visible.includes(key) ? visible.filter((k) => k !== key) : [...visible, key]
}

/** Keys of nodes that are actually shown: the node and every ancestor are visible. */
export function getTreeViewableKeys<T>(
  nodes: Nodes<T>,
  visible: Iterable<GsTreeKey>,
): Set<GsTreeKey> {
  const flags = new Set(visible)
  const viewable = new Set<GsTreeKey>()
  const visit = (list: Nodes<T>) => {
    for (const node of list) {
      if (!flags.has(node.key)) continue
      viewable.add(node.key)
      if (node.children) visit(node.children)
    }
  }
  visit(nodes)
  return viewable
}

/* ---------------------------------------------------------------------------------------------- */
/* Layout                                                                                          */
/* ---------------------------------------------------------------------------------------------- */

/** @internal Where a node sits among its siblings, for drawing rule lines. */
export interface GsTreeNodeLayout {
  /** The node is the last of its siblings. */
  last: boolean
  /** For each ancestor, root first: whether it is the last of its siblings. */
  ancestorsLast: boolean[]
}

/** @internal Sibling positions of every node, keyed by node key. */
export function getTreeLayout<T>(nodes: Nodes<T>): Map<GsTreeKey, GsTreeNodeLayout> {
  const layout = new Map<GsTreeKey, GsTreeNodeLayout>()
  const visit = (list: Nodes<T>, ancestorsLast: boolean[]) => {
    list.forEach((node, index) => {
      const last = index === list.length - 1
      layout.set(node.key, { last, ancestorsLast })
      if (node.children) visit(node.children, [...ancestorsLast, last])
    })
  }
  visit(nodes, [])
  return layout
}
