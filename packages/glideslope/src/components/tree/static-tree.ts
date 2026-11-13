/**
 * @internal How `GsTree` reads a tree written as nested `GsTreeItem` markup.
 *
 * Reka UI's `TreeRoot` is driven by an items array, so markup is turned into one: `GsTree` renders
 * its default slot once inside a hidden element, where each `GsTreeItem` registers a node with its
 * parent (the tree or the enclosing item) and renders only an empty element holding its children.
 * `GsTree` builds `GsTreeNode`s from the registrations and renders rows from them exactly as for
 * `items`, filling each row with its item's `#content` slot.
 */
import {
  h,
  inject,
  provide,
  type FunctionalComponent,
  type InjectionKey,
  type ShallowRef,
  type VNodeChild,
} from 'vue'
import GsTreeItemLabel from './GsTreeItemLabel.vue'
import type { GsTreeItemSlotProps, GsTreeKey, GsTreeNode } from './types'

/** A registered `GsTreeItem`. */
export interface StaticTreeEntry {
  key: () => GsTreeKey
  label: () => string
  disabled: () => boolean
  /** The item's `#content` slot, refreshed whenever the item re-renders with new slots. */
  content: ShallowRef<((props: GsTreeItemSlotProps) => unknown) | undefined>
  /** The item's element in the hidden markup, to put siblings in document order. */
  el: Readonly<ShallowRef<HTMLElement | null>>
  /** Child items, in registration order. */
  children: StaticTreeEntry[]
}

const key: InjectionKey<StaticTreeEntry[] | undefined> = Symbol('GsTreeStaticItems')

/** Collects the `GsTreeItem`s below: the tree's root items, or an item's children. */
export function provideStaticTreeItems(items: StaticTreeEntry[] | undefined) {
  provide(key, items)
}

export function injectStaticTreeItems(): StaticTreeEntry[] | undefined {
  return inject(key, undefined)
}

/**
 * Registration follows mount order, which differs from document order for an item that mounts
 * after its siblings (a `v-if` turning true, a `v-for` gaining an entry in the middle). Once every
 * sibling has mounted, their elements give the real order.
 */
function inDocumentOrder(entries: readonly StaticTreeEntry[]): readonly StaticTreeEntry[] {
  if (entries.some((entry) => !entry.el.value)) return entries
  return [...entries].sort((a, b) =>
    a.el.value!.compareDocumentPosition(b.el.value!) & Node.DOCUMENT_POSITION_FOLLOWING ? -1 : 1,
  )
}

/** Builds tree data from registered items. Reactive: it tracks every item's props and children. */
export function toTreeNodes<T>(entries: readonly StaticTreeEntry[]): GsTreeNode<T>[] {
  return inDocumentOrder(entries).map((entry) => {
    const children = toTreeNodes<T>(entry.children)
    return {
      key: entry.key(),
      label: entry.label(),
      disabled: entry.disabled(),
      children: children.length ? children : undefined,
    }
  })
}

/** Indexes registered items by key, for filling their rows. */
export function indexStaticTreeItems(
  entries: readonly StaticTreeEntry[],
  index = new Map<GsTreeKey, StaticTreeEntry>(),
): Map<GsTreeKey, StaticTreeEntry> {
  for (const entry of entries) {
    index.set(entry.key(), entry)
    indexStaticTreeItems(entry.children, index)
  }
  return index
}

/** A row's content from markup: the item's `#content` slot, or its label. */
export const GsTreeStaticContent: FunctionalComponent<{
  entry: StaticTreeEntry | undefined
  row: GsTreeItemSlotProps
}> = ({ entry, row }) =>
  (entry?.content.value?.(row) as VNodeChild) ?? h(GsTreeItemLabel, () => row.node.label)

GsTreeStaticContent.props = ['entry', 'row']
