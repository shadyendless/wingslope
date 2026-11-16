<script setup lang="ts">
/**
 * @internal The drag handle at the end of a `GsTree` row with `drag-and-drop`: the dnd-kit
 * activator for dragging the row, with a pointer or (Space / Enter) the keyboard. It is named from
 * the row's node, like the row's other controls, and is in the tab order only in the row that is
 * the tree's tab stop.
 */
import { useDraggable } from '@dnd-kit/vue'
import DragVertIcon from '@wingbrace/glideslope-icons/drag-vert'
import { computed, onBeforeUnmount, useTemplateRef, watch, type ComponentPublicInstance } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import { injectTreeContext } from './context'
import styles from './styles.module.css'
import type { GsTreeKey } from './types'

const { nodeKey, label, disabled, tabStop } = defineProps<{
  nodeKey: GsTreeKey
  label: string
  disabled: boolean
  tabStop: boolean
}>()

const tree = injectTreeContext()!
const handle = useTemplateRef<ComponentPublicInstance>('handle')
const button = computed(() => handle.value?.$el as HTMLElement | undefined)
const row = computed(() => button.value?.closest<HTMLElement>('[role="treeitem"]') ?? undefined)

useDraggable({ id: () => nodeKey, element: row, handle: button, disabled: () => disabled })

let unregister: (() => void) | undefined
watch(
  [row, () => nodeKey],
  ([element, key]) => {
    unregister?.()
    unregister = element && tree.registerRow(key, element)
  },
  { immediate: true, flush: 'post' },
)
onBeforeUnmount(() => unregister?.())
</script>

<template>
  <GsButton
    ref="handle"
    variant="icon"
    color="mono-bold"
    :disabled="disabled"
    :aria-label="`Drag ${label}`"
    :tabindex="tabStop ? 0 : -1"
    data-tree-drag-handle
    :class="styles.drag"
    @click.stop
  >
    <GsIcon><DragVertIcon /></GsIcon>
  </GsButton>
</template>
