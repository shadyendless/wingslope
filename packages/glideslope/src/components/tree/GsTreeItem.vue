<script setup lang="ts">
/**
 * One node of a `GsTree` written in markup rather than passed as `items`. Nest `GsTreeItem`s in
 * its default slot for its children, and put the row's content (`GsTreeItemPrefixIcon`,
 * `GsTreeItemLabel`, `GsTreeItemDescription`, `GsTreeItemActions`) in its `#content` slot, which
 * receives the row state. Without `#content`, the row shows `label`.
 *
 * Use it only directly in a `GsTree` without `items`, or in another `GsTreeItem`.
 *
 * @example
 * ```vue
 * <GsTree v-model:expanded="expanded" aria-label="Produce">
 *   <GsTreeItem value="fruit" label="Fruit">
 *     <GsTreeItem value="apples" label="Apples" />
 *   </GsTreeItem>
 *   <GsTreeItem value="vegetables" label="Vegetables">
 *     <template #content="{ selected }">
 *       <GsTreeItemLabel>Vegetables</GsTreeItemLabel>
 *       <GsTreeItemDescription>{{ selected ? 'In the basket' : 'Not picked' }}</GsTreeItemDescription>
 *     </template>
 *   </GsTreeItem>
 * </GsTree>
 * ```
 */
import { onBeforeUnmount, onBeforeUpdate, shallowReactive, shallowRef, useTemplateRef } from 'vue'
import { injectStaticTreeItems, provideStaticTreeItems, type StaticTreeEntry } from './static-tree'
import type { GsTreeItemProps, GsTreeItemSlotProps } from './types'

const { value, label, disabled = false } = defineProps<GsTreeItemProps>()

const slots = defineSlots<{
  /** Child `GsTreeItem`s. */
  default?: () => unknown
  /** The row's content, with the row state. Defaults to `GsTreeItemLabel` with `label`. */
  content?: (props: GsTreeItemSlotProps) => unknown
}>()

const siblings = injectStaticTreeItems()
if (!siblings) throw new Error('GsTreeItem must be inside a GsTree without items')

const entry: StaticTreeEntry = {
  key: () => value,
  label: () => label,
  disabled: () => disabled,
  content: shallowRef(slots.content),
  el: useTemplateRef<HTMLElement>('el'),
  children: shallowReactive([]),
}
siblings.push(entry)
provideStaticTreeItems(entry.children)

// The tree renders the slot in its rows, so pass on a slot that changed (a dynamic `#content`).
onBeforeUpdate(() => {
  entry.content.value = slots.content
})
onBeforeUnmount(() => {
  const index = siblings.indexOf(entry)
  if (index !== -1) siblings.splice(index, 1)
})
</script>

<template>
  <!-- Inside the tree's hidden markup container: holds the children, and marks document order. -->
  <div ref="el"><slot /></div>
</template>
