/** Unique key of a tree node. Keys are strings so they can round-trip through Reka UI's tree. */
export type GsTreeKey = string

/** Row density. */
export type GsTreeVariant = 'cozy' | 'compact' | 'crammed'

/** How many nodes can be selected. */
export type GsTreeSelectionMode = 'none' | 'single' | 'multiple'

/** Where nodes go relative to a target node. `into` makes them its first children. */
export type GsTreeInsertPosition = 'before' | 'after' | 'into'

/**
 * One node of tree data. The tree's state (selected, expanded, visible) lives in key arrays
 * bound with `v-model`. The `expanded`, `selected` and `visible` flags only set its initial value.
 *
 * @template T Application-specific data carried in `values`.
 */
export interface GsTreeNode<T = unknown> {
  /** Unique key across the whole tree. */
  key: GsTreeKey
  /**
   * The row's accessible name, and its text when no slot content is given. Also names the row's
   * visibility toggle.
   */
  label: string
  /** Application-specific data, available to the row slot as `node.values`. */
  values?: T
  /** Prevents focusing, selecting, expanding and toggling the visibility of this node. */
  disabled?: boolean
  /**
   * Starts expanded. Read once, by `useTree` and by a `GsTree` without `v-model:expanded`; the
   * expanded keys hold the state after that.
   */
  expanded?: boolean
  /**
   * Starts selected. Read once, by `useTree` and by a `GsTree` without `v-model`; the selected keys
   * hold the state after that.
   */
  selected?: boolean
  /**
   * Starts visible (with `show-visibility`). Read once, by `useTree` and by a `GsTree` without
   * `v-model:visible`; the visible keys hold the state after that.
   */
  visible?: boolean
  /** Child nodes. A node with an empty array is treated as a leaf. */
  children?: GsTreeNode<T>[]
}

/** Node flags that set a tree's initial state. */
export type GsTreeStateFlag = 'expanded' | 'selected' | 'visible'

export interface GsTreeProps<T = unknown> {
  /**
   * Tree data. Update it immutably (see `useTree`) so the tree re-renders. Leave it out to write
   * the tree as nested `GsTreeItem`s in the default slot instead.
   */
  items?: GsTreeNode<T>[]
  /** Row density. `crammed` hides descriptions. @default 'cozy' */
  variant?: GsTreeVariant
  /** Draw dotted connector lines between parents and children. @default true */
  showRuleLines?: boolean
  /**
   * Show an eye toggle on each row, bound with `v-model:visible`. Rows that are hidden, or have a
   * hidden ancestor, are muted. @default false
   */
  showVisibility?: boolean
  /** How many nodes can be selected. Selectable rows show a checkbox. @default 'multiple' */
  selectionMode?: GsTreeSelectionMode
  /**
   * With `selectionMode="multiple"`: selecting a parent selects every enabled descendant, and a
   * parent is selected when all its enabled children are, indeterminate when some are.
   * @default false
   */
  selectionCascade?: boolean
  /** Keys of disabled nodes, in addition to nodes with `disabled: true`. */
  disabledKeys?: GsTreeKey[]
  /** Disables the whole tree. */
  disabled?: boolean
}

/** Props passed to the `GsTree` row slot. */
export interface GsTreeItemSlotProps<T = unknown> {
  /** The node this row renders. */
  node: GsTreeNode<T>
  /** Depth, starting at 1 for root nodes. */
  level: number
  /** Whether the node has children. */
  hasChildren: boolean
  expanded: boolean
  selected: boolean
  /** Some, but not all, enabled descendants are selected (`selectionCascade` only). */
  indeterminate: boolean
  disabled: boolean
  /** The node's own visibility flag. Always `true` without `showVisibility`. */
  visible: boolean
  /** The node and all its ancestors are visible. Always `true` without `showVisibility`. */
  viewable: boolean
  /** The tree's density. */
  variant: GsTreeVariant
}

export interface GsTreeItemProps {
  /** The node's key, unique across the whole tree. */
  value: GsTreeKey
  /**
   * The row's accessible name, and its text when there is no `#content` slot. Also names the row's
   * visibility toggle.
   */
  label: string
  /** Prevents focusing, selecting, expanding and toggling the visibility of this node. */
  disabled?: boolean
}

export interface GsTreeItemPrefixIconProps {
  /** Icon size. Defaults to the row's icon size (`medium` when cozy, `small` otherwise). */
  size?: 'large' | 'medium' | 'small' | 'xsmall'
}
