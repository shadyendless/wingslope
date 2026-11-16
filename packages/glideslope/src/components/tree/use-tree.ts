import { ref, shallowRef, type Ref, type ShallowRef } from 'vue'
import {
  findTreeNode,
  getTreeFlaggedKeys,
  getTreeKeys,
  getTreeParentKeys,
  getTreeStepMove,
  insertTreeNodes,
  moveTreeNodes,
  normalizeTreeSelection,
  removeTreeNodes,
  updateTreeNode,
} from './tree-data'
import type {
  GsTreeInsertPosition,
  GsTreeKey,
  GsTreeMove,
  GsTreeMoveDirection,
  GsTreeNode,
  GsTreeStateFlag,
} from './types'

export interface UseTreeOptions<T> {
  /** Initial tree data. */
  items: GsTreeNode<T>[]
  /** Initially expanded keys. Defaults to the nodes flagged `expanded: true`. */
  expanded?: GsTreeKey[]
  /** Initially selected keys. Defaults to the nodes flagged `selected: true`. */
  selected?: GsTreeKey[]
  /** Initially visible keys. Defaults to the nodes flagged `visible: true`. */
  visible?: GsTreeKey[]
  /**
   * Keep a cascading selection consistent when nodes move, are inserted or removed. Pair it with
   * `selection-cascade` on `GsTree`. @default false
   */
  selectionCascade?: boolean
}

export interface UseTree<T> {
  /** Tree data, for `GsTree`'s `items`. Replaced (never mutated) by every structural action. */
  nodes: ShallowRef<GsTreeNode<T>[]>
  /** Expanded keys, for `v-model:expanded`. */
  expanded: Ref<GsTreeKey[]>
  /** Selected keys, for `v-model`. */
  selected: Ref<GsTreeKey[]>
  /** Visible keys, for `v-model:visible`. */
  visible: Ref<GsTreeKey[]>

  /** Finds a node by key. */
  getNode: (key: GsTreeKey) => GsTreeNode<T> | undefined

  expandAll: () => void
  collapseAll: () => void
  /** Selects every enabled node. */
  selectAll: () => void
  unselectAll: () => void
  /** Makes every node visible. */
  revealAll: () => void
  hideAll: () => void

  /** Inserts nodes before a sibling, or at the start of the root level for `null`. */
  insertBefore: (target: GsTreeKey | null, nodes: GsTreeNode<T>[]) => void
  /** Inserts nodes after a sibling, or at the end of the root level for `null`. */
  insertAfter: (target: GsTreeKey | null, nodes: GsTreeNode<T>[]) => void
  /** Inserts nodes as the first children of a node, or at the start of the root level for `null`. */
  insertInto: (target: GsTreeKey | null, nodes: GsTreeNode<T>[]) => void
  /** Moves nodes before a sibling. */
  moveBefore: (target: GsTreeKey | null, keys: Iterable<GsTreeKey>) => void
  /** Moves nodes after a sibling. */
  moveAfter: (target: GsTreeKey | null, keys: Iterable<GsTreeKey>) => void
  /** Moves nodes into a node, as its first children. */
  moveInto: (target: GsTreeKey | null, keys: Iterable<GsTreeKey>) => void
  /** Applies a move: bind it to `GsTree`'s `move` event (`drag-and-drop`). */
  applyMove: (move: GsTreeMove) => void
  /**
   * Moves a node one step (`up`, `down`, `indent`, `outdent`, see `getTreeStepMove`): the
   * non-drag alternative to dragging, for a row menu or buttons. Does nothing when it can't go that
   * way.
   */
  moveStep: (key: GsTreeKey, direction: GsTreeMoveDirection) => void
  /** Whether `moveStep` can move a node that way, to disable a menu item or button. */
  canMoveStep: (key: GsTreeKey, direction: GsTreeMoveDirection) => boolean
  /** Removes nodes and their descendants, and forgets their keys. */
  remove: (keys: Iterable<GsTreeKey>) => void
  /** Replaces a node with the result of `update`. */
  updateNode: (key: GsTreeKey, update: (node: GsTreeNode<T>) => GsTreeNode<T>) => void
}

/**
 * Holds tree data and state for a `GsTree`, with actions to change them. The data transforms are
 * the pure functions from `tree-data.ts`; use those directly to keep the data somewhere else
 * (a store, a server).
 *
 * With `drag-and-drop`, bind `applyMove` to the tree's `move` event; `moveStep` offers the same
 * moves without dragging.
 *
 * @example
 * ```vue
 * <script setup lang="ts">
 * const { nodes, selected, expanded, visible, expandAll } = useTree({ items: layers })
 * </script>
 *
 * <template>
 *   <GsTree
 *     v-model="selected"
 *     v-model:expanded="expanded"
 *     v-model:visible="visible"
 *     :items="nodes"
 *     show-visibility
 *     aria-label="Layers"
 *   />
 * </template>
 * ```
 */
export function useTree<T>(options: UseTreeOptions<T>): UseTree<T> {
  const { items, selectionCascade = false } = options
  const nodes = shallowRef<GsTreeNode<T>[]>(items)
  const initial = (flag: GsTreeStateFlag) => [...(options[flag] ?? getTreeFlaggedKeys(items, flag))]
  const expanded = ref<GsTreeKey[]>(initial('expanded'))
  const selected = ref<GsTreeKey[]>(initial('selected'))
  const visible = ref<GsTreeKey[]>(initial('visible'))

  /** Applies a structural change, then drops stale keys and re-derives a cascading selection. */
  function change(next: GsTreeNode<T>[]) {
    if (next === nodes.value) return
    nodes.value = next
    const keys = new Set(getTreeKeys(next))
    const known = (list: GsTreeKey[]) => list.filter((key) => keys.has(key))
    expanded.value = known(expanded.value)
    visible.value = known(visible.value)
    selected.value = selectionCascade
      ? normalizeTreeSelection(next, selected.value)
      : known(selected.value)
  }

  const insert =
    (position: GsTreeInsertPosition) => (target: GsTreeKey | null, inserted: GsTreeNode<T>[]) =>
      change(insertTreeNodes(nodes.value, target, inserted, position))

  const move =
    (position: GsTreeInsertPosition) => (target: GsTreeKey | null, keys: Iterable<GsTreeKey>) =>
      change(moveTreeNodes(nodes.value, keys, target, position))
  const applyMove = ({ keys, target, position }: GsTreeMove) => move(position)(target, keys)

  return {
    nodes,
    expanded,
    selected,
    visible,

    getNode: (key) => findTreeNode(nodes.value, key),

    expandAll: () => {
      expanded.value = getTreeParentKeys(nodes.value)
    },
    collapseAll: () => {
      expanded.value = []
    },
    selectAll: () => {
      selected.value = getTreeKeys(nodes.value, (node) => !node.disabled)
    },
    unselectAll: () => {
      selected.value = []
    },
    revealAll: () => {
      visible.value = getTreeKeys(nodes.value)
    },
    hideAll: () => {
      visible.value = []
    },

    insertBefore: insert('before'),
    insertAfter: insert('after'),
    insertInto: insert('into'),
    moveBefore: move('before'),
    moveAfter: move('after'),
    moveInto: move('into'),
    applyMove,
    moveStep: (key, direction) => {
      const step = getTreeStepMove(nodes.value, key, direction)
      if (step) applyMove(step)
    },
    canMoveStep: (key, direction) => getTreeStepMove(nodes.value, key, direction) !== undefined,
    remove: (keys) => change(removeTreeNodes(nodes.value, keys)),
    updateNode: (key, update) => change(updateTreeNode(nodes.value, key, update)),
  }
}
