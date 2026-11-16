<script setup lang="ts">
/**
 * One column of a board: a `GsKanbanColumnHeader`, a `GsKanbanColumnContent` with its cards, and
 * optionally `GsKanbanColumnActions`. The whole column takes dropped cards, so a card can go into
 * an empty column; it is outlined while a card is over it. A column with `canDrop: false` takes no
 * cards. It is a group named by its `GsKanbanColumnHeaderTitle`.
 */
import { useDragOperation, useDroppable } from '@dnd-kit/vue'
import { isSortable } from '@dnd-kit/vue/sortable'
import { computed, useTemplateRef } from 'vue'
import { injectKanbanContext, provideKanbanColumnTitles } from './context'
import styles from './styles.module.css'
import type { GsKanbanColumnProps } from './types'

const { column } = defineProps<GsKanbanColumnProps>()

defineSlots<{
  /** The header, content and actions. */
  default?: () => unknown
}>()

const board = injectKanbanContext('GsKanbanColumn')
const element = useTemplateRef<HTMLElement>('element')
const dropId = computed(() => board.dropId(column.id))
const accepts = computed(() => column.canDrop !== false)

useDroppable({
  id: dropId,
  element,
  type: 'column',
  accept: 'card',
  // Below the cards, so the column only takes drops outside them.
  collisionPriority: 1,
  disabled: () => !accepts.value,
})

const operation = useDragOperation()
/** A card is over the column, or over a card in it. */
const isOver = computed(() => {
  const { source, target } = operation
  if (!source || !target) return false
  if (board.columnIdOf(target.id) === column.id) return true
  return isSortable(target) && target.sortable.group === dropId.value
})
/** A card from another column is being dragged, and this column could take it. */
const isCandidate = computed(() => {
  const source = operation.source
  return (
    !!source && accepts.value && board.cardMap.value.get(String(source.id))?.column.id !== column.id
  )
})

const titleIds = provideKanbanColumnTitles()
</script>

<template>
  <div
    ref="element"
    role="group"
    :aria-labelledby="titleIds.length ? titleIds.join(' ') : undefined"
    :aria-label="titleIds.length ? undefined : column.title"
    :class="styles.column"
    :data-highlighted="isOver || isCandidate ? '' : undefined"
    :data-drop-target="isOver && accepts ? '' : undefined"
  >
    <slot />
  </div>
</template>
