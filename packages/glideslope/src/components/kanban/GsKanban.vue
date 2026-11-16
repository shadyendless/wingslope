<script setup lang="ts">
/**
 * A board of columns and cards that users reorder by dragging cards within and between columns,
 * with a pointer or the keyboard. Bind the columns with `v-model:columns`: a drop replaces them
 * with the card moved and the cards' `columnId` and `position` renumbered.
 *
 * Compose the board from `GsKanbanHeader` and `GsKanbanColumnContainer`, with a `GsKanbanColumn`,
 * `GsKanbanColumnContent` and `GsKanbanCard` per column and card. `useKanban()` gives components
 * inside the board its state and `moveCard`. For people who can't drag, put a
 * `GsKanbanCardMoveMenu` in the cards. Built on dnd-kit, so it runs only in the browser.
 *
 * @example
 * ```vue
 * <GsKanban v-model:columns="columns">
 *   <GsKanbanColumnContainer>
 *     <GsKanbanColumn v-for="column in columns" :key="column.id" :column="column">
 *       <GsKanbanColumnHeader>
 *         <GsKanbanColumnHeaderTitle>{{ column.title }}</GsKanbanColumnHeaderTitle>
 *       </GsKanbanColumnHeader>
 *       <GsKanbanColumnContent :column="column">
 *         <GsKanbanCard v-for="card in column.cards" :key="card.id" :card="card">
 *           <GsKanbanCardHeader>
 *             <GsKanbanCardHeaderTitle>{{ card.title }}</GsKanbanCardHeaderTitle>
 *           </GsKanbanCardHeader>
 *           <GsKanbanCardBody>{{ card.body }}</GsKanbanCardBody>
 *         </GsKanbanCard>
 *       </GsKanbanColumnContent>
 *     </GsKanbanColumn>
 *   </GsKanbanColumnContainer>
 * </GsKanban>
 * ```
 */
import { DragDropProvider, DragOverlay } from '@dnd-kit/vue'
import { computed, nextTick, useId } from 'vue'
import { provideKanbanContext, type KanbanContext } from './context'
import { getKanbanCardMap, moveKanbanCard, validateMoveCard } from './kanban-data'
import styles from './styles.module.css'
import type { GsKanbanCardData, GsKanbanColumnData, GsKanbanMoveCard } from './types'
import { useKanbanDrag } from './use-kanban-drag'

// The root is a fragment (the board and dnd-kit's drag overlay), so attributes go on the board.
defineOptions({ inheritAttrs: false })

/** The board's columns, each with its cards in order. */
const columns = defineModel<GsKanbanColumnData[]>('columns', { required: true })

defineSlots<{
  /** The board's header and `GsKanbanColumnContainer`. */
  default?: () => unknown
}>()

// Droppable ids share one namespace with card ids, so columns and their empty slots get prefixes.
const uid = useId()
const dropId = (columnId: string) => `${uid}:column:${columnId}`
const slotId = (columnId: string) => `${uid}:empty:${columnId}`
const prefixes = [dropId(''), slotId('')]
const columnIdOf = (id: unknown) => {
  if (typeof id !== 'string') return undefined
  const prefix = prefixes.find((p) => id.startsWith(p))
  return prefix === undefined ? undefined : id.slice(prefix.length)
}

const cardMap = computed(() => getKanbanCardMap(columns.value))
const getColumnById = (id: string) => columns.value.find((column) => column.id === id)

const moveCard: GsKanbanMoveCard = (cardId, targetColumnId, targetPosition, closestEdge) => {
  const validation = validateMoveCard(columns.value, cardId, targetColumnId, targetPosition)
  if (!validation.success) {
    validation.errors.forEach((error) => console.error(error))
    return false
  }
  const next = moveKanbanCard(
    columns.value,
    cardId,
    targetColumnId,
    validation.adjustedPosition,
    closestEdge,
  )
  if (next) columns.value = next
  return next !== undefined
}

const shown = new Map<string, () => readonly GsKanbanCardData[]>()
const shownCards = (columnId: string) =>
  shown.get(columnId)?.() ?? getColumnById(columnId)?.cards ?? []

const cardElements = new Map<string, HTMLElement>()
const focusCard = (id: string) => void nextTick(() => cardElements.get(id)?.focus())

const board = {
  columns: computed(() => columns.value),
  updateColumns: (next: GsKanbanColumnData[]) => (columns.value = next),
  moveCard,
  getColumnById,
  cardMap,
  dropId,
  slotId,
  columnIdOf,
  shownCards,
  focusCard,
}
const drag = useKanbanDrag(board)

const context: KanbanContext = {
  ...board,
  activeCardId: drag.activeCardId,
  renderKey: drag.renderKey,
  registerShownCards: (columnId, cards) => {
    shown.set(columnId, cards)
    return () => {
      if (shown.get(columnId) === cards) shown.delete(columnId)
    }
  },
  registerCard: (id, element) => {
    cardElements.set(id, element)
    return () => {
      if (cardElements.get(id) === element) cardElements.delete(id)
    }
  },
}
provideKanbanContext(context)

const overlayCard = (id: unknown) => cardMap.value.get(String(id))?.card
</script>

<template>
  <DragDropProvider v-bind="drag.provider">
    <div v-bind="$attrs" :class="styles.kanban"><slot /></div>
    <!-- A copy of the dragged card that follows the pointer. -->
    <DragOverlay :drop-animation="null" aria-hidden="true">
      <template #default="{ source }">
        <div v-if="overlayCard(source.id)" :class="styles.card" data-current>
          <div :class="[styles.header, styles.cardHeader]">
            <span :class="styles.cardTitle">{{ overlayCard(source.id)?.title }}</span>
          </div>
          <div :class="styles.cardBody">{{ overlayCard(source.id)?.body }}</div>
        </div>
      </template>
    </DragOverlay>
  </DragDropProvider>
</template>
