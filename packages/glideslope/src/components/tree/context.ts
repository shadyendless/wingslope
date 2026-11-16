import {
  computed,
  inject,
  onBeforeUnmount,
  provide,
  reactive,
  watchEffect,
  type ComputedRef,
  type InjectionKey,
  type Ref,
} from 'vue'
import type { GsTreeNodeLayout } from './tree-data'
import type { GsTreeKey, GsTreeSelectionMode, GsTreeVariant } from './types'

/** @internal What rows show while a node is dragged. */
export interface TreeDropView {
  /** The dragged node and its visible descendants, which travel with it. */
  dragging: ReadonlySet<GsTreeKey>
  /** The node the dragged one would go into, or `null` for the root level. */
  parent: GsTreeKey | null
  /** The row that shows the drop line, and on which edge. */
  indicator: { key: GsTreeKey; edge: 'top' | 'bottom' } | undefined
}

/** @internal State `GsTree` shares with its rows and their parts. */
export interface TreeContext {
  variant: ComputedRef<GsTreeVariant>
  showRuleLines: ComputedRef<boolean>
  showVisibility: ComputedRef<boolean>
  selectionMode: ComputedRef<GsTreeSelectionMode>
  layout: ComputedRef<Map<GsTreeKey, GsTreeNodeLayout>>
  isDisabled: (key: GsTreeKey) => boolean
  isVisible: (key: GsTreeKey) => boolean
  isViewable: (key: GsTreeKey) => boolean
  isIndeterminate: (key: GsTreeKey) => boolean
  /** Toggles a node's selection according to the selection mode. */
  select: (key: GsTreeKey) => void
  toggleVisibility: (key: GsTreeKey) => void
  /**
   * The row that last held focus, which is Reka's roving tab stop. Only its controls are in the tab
   * order, so Tab doesn't walk through every row's buttons.
   */
  tabStopKey: Ref<GsTreeKey | undefined>
  /** Rows have drag handles. */
  dragAndDrop: ComputedRef<boolean>
  /** The drop preview while a node is dragged. */
  drop: ComputedRef<TreeDropView | undefined>
  /** Records a row's element, for finding the gap under the pointer. Returns the cleanup. */
  registerRow: (key: GsTreeKey, element: HTMLElement) => () => void
}

const key: InjectionKey<TreeContext> = Symbol('GsTree')

export function provideTreeContext(context: TreeContext) {
  provide(key, context)
}

export function injectTreeContext(): TreeContext | undefined {
  return inject(key, undefined)
}

/** The tree's density, for parts that may also render outside a tree. */
export function injectTreeVariant(): ComputedRef<GsTreeVariant> {
  const tree = injectTreeContext()
  return computed(() => tree?.variant.value ?? 'cozy')
}

const itemKey: InjectionKey<ComputedRef<boolean>> = Symbol('GsTreeItemTabStop')

/** @internal Whether the current row is the tree's tab stop, for controls inside the row. */
export function provideTreeItemTabStop(isTabStop: ComputedRef<boolean>) {
  provide(itemKey, isTabStop)
}

export function injectTreeItemTabStop(): ComputedRef<boolean> | undefined {
  return inject(itemKey, undefined)
}

const rowTextKey: InjectionKey<string[]> = Symbol('GsTreeRowText')

/**
 * @internal The ids of the row's `GsTreeItemLabel` / `GsTreeItemDescription`, in render order. The
 * row is named by them (`aria-labelledby`), so its name matches its visible text without taking in
 * the names of buttons inside it.
 */
export function provideTreeRowText(): string[] {
  const ids = reactive<string[]>([])
  provide(rowTextKey, ids)
  return ids
}

/** Adds a text part's id to its row's name while `rendered()` is true. */
export function useTreeRowText(id: string, rendered: () => boolean = () => true) {
  const ids = inject(rowTextKey, undefined)
  if (!ids) return
  const remove = () => {
    const index = ids.indexOf(id)
    if (index !== -1) ids.splice(index, 1)
  }
  watchEffect(() => {
    if (rendered()) {
      if (!ids.includes(id)) ids.push(id)
    } else remove()
  })
  onBeforeUnmount(remove)
}
