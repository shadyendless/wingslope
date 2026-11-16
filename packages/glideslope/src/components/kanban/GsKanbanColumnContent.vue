<script setup lang="ts">
/**
 * The list of cards in a column. Pass it the column whose cards you render: the filtered one when
 * the board filters cards, so cards drop between the ones that are shown.
 */
import { useDroppable } from '@dnd-kit/vue'
import { computed, onBeforeUnmount, useTemplateRef, watch } from 'vue'
import { injectKanbanContext, provideKanbanContent } from './context'
import styles from './styles.module.css'
import type { GsKanbanColumnContentProps } from './types'

const { column } = defineProps<GsKanbanColumnContentProps>()

defineSlots<{
  /** The column's `GsKanbanCard`s, in the order of `column.cards`. */
  default?: () => unknown
}>()

const board = injectKanbanContext('GsKanbanColumnContent')
// The list is keyed by `renderKey`: it is rebuilt when a drop leaves dnd-kit's sortables out of
// step with the data (see `useKanbanDrag`).
const shown = computed(() => column)
provideKanbanContent(shown)
let unregister: (() => void) | undefined
watch(
  () => column.id,
  (id) => {
    unregister?.()
    unregister = board.registerShownCards(id, () => column.cards)
  },
  { immediate: true },
)
onBeforeUnmount(() => unregister?.())

// An empty column lists a card-sized slot to drop on. The column takes drops too, but dnd-kit's
// keyboard sorting ranks it below cards, so without the slot arrow keys would skip the column.
const empty = useTemplateRef<HTMLElement>('empty')
useDroppable({
  id: () => board.slotId(column.id),
  element: empty,
  type: 'column',
  accept: 'card',
  disabled: () => column.cards.length > 0 || board.getColumnById(column.id)?.canDrop === false,
})
</script>

<template>
  <ol :key="board.renderKey.value" :class="styles.columnContent">
    <slot />
    <li v-if="!column.cards.length" ref="empty" aria-hidden="true" :class="styles.emptySlot" />
  </ol>
</template>
