<script setup lang="ts">
/**
 * One card of a board, inside a `GsKanbanColumnContent`. Drag it with a pointer, or focus it and
 * press Space or Enter to move it with the arrow keys. While dragged, a copy follows the pointer
 * and the card itself marks where it will land. Put a `GsKanbanCardHeader` and `GsKanbanCardBody`
 * in it. The card is a focusable list item named by its `title`; attributes go on its box.
 */
import { useSortable } from '@dnd-kit/vue/sortable'
import { computed, onBeforeUnmount, useTemplateRef, watch } from 'vue'
import { injectKanbanContent, injectKanbanContext } from './context'
import styles from './styles.module.css'
import type { GsKanbanCardProps } from './types'

// The list item is the dnd-kit element; attributes go on the card's box inside it. The item must
// be the template's only root node (no comment beside it): optimistic sorting moves it between
// lists, and Vue removes a fragment root by what lies between its anchors. Its explicit role and
// tabindex keep dnd-kit from making it a button, which would hide its controls from assistive
// technology.
defineOptions({ inheritAttrs: false })

const { card, active = undefined } = defineProps<GsKanbanCardProps>()

defineSlots<{
  /** The card's header and body. */
  default?: () => unknown
}>()

const board = injectKanbanContext('GsKanbanCard')
const content = injectKanbanContent()
const element = useTemplateRef<HTMLElement>('element')

const columnId = computed(() => content?.value.id ?? card.columnId)
const index = computed(() => {
  const found = content?.value.cards.findIndex(({ id }) => id === card.id) ?? -1
  return found === -1 ? card.position : found
})
const accepts = computed(() => board.getColumnById(columnId.value)?.canDrop !== false)

const { isDragging } = useSortable({
  id: () => card.id,
  index,
  group: () => board.dropId(columnId.value),
  element,
  type: 'card',
  accept: 'card',
  disabled: () => ({ draggable: false, droppable: !accepts.value }),
})

let unregister: (() => void) | undefined
watch(
  [element, () => card.id],
  ([el, id]) => {
    unregister?.()
    unregister = el ? board.registerCard(id, el) : undefined
  },
  { immediate: true, flush: 'post' },
)
onBeforeUnmount(() => unregister?.())
</script>

<template>
  <li
    ref="element"
    role="listitem"
    tabindex="0"
    :aria-label="card.title"
    :class="['group/kanban-card', styles.cardContainerOuter]"
  >
    <div
      v-bind="$attrs"
      :class="styles.card"
      :data-dragging="isDragging ? '' : undefined"
      :data-current="(active ?? card.active) ? '' : undefined"
    >
      <slot />
    </div>
  </li>
</template>
