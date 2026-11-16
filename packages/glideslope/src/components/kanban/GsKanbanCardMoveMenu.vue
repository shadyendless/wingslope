<script setup lang="ts">
/**
 * A menu button that moves its card without dragging: up or down among the cards its column shows,
 * or to the end of another column. It is the single-pointer alternative to dragging, for people
 * who can't drag. Put it in a card's `GsKanbanCardHeaderActions`. After a move, the card keeps the
 * focus.
 *
 * @example
 * ```vue
 * <GsKanbanCardHeaderActions>
 *   <GsKanbanCardMoveMenu :card="card" />
 * </GsKanbanCardHeaderActions>
 * ```
 */
import MoveIcon from '@wingbrace/glideslope-icons/move'
import { computed } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsMenu from '../menu/GsMenu.vue'
import GsMenuItem from '../menu/GsMenuItem.vue'
import GsMenuSection from '../menu/GsMenuSection.vue'
import GsMenuSeparator from '../menu/GsMenuSeparator.vue'
import { injectKanbanContent, injectKanbanContext } from './context'
import type { GsKanbanCardMoveMenuProps } from './types'

const { card } = defineProps<GsKanbanCardMoveMenuProps>()

const board = injectKanbanContext('GsKanbanCardMoveMenu')
const content = injectKanbanContent()

const columnId = computed(() => board.cardMap.value.get(card.id)?.column.id ?? card.columnId)
/** The cards the column shows (it may filter them), in order. */
const shown = computed(() => content?.value.cards ?? board.shownCards(columnId.value))
const shownIndex = computed(() => shown.value.findIndex(({ id }) => id === card.id))
const previous = computed(() => shown.value[shownIndex.value - 1])
const next = computed(() => shown.value[shownIndex.value + 1])
const otherColumns = computed(() =>
  board.columns.value.filter((column) => column.id !== columnId.value),
)

const position = (id: string) =>
  board.getColumnById(columnId.value)?.cards.findIndex((c) => c.id === id) ?? -1

function moveUp() {
  if (previous.value)
    moved(board.moveCard(card.id, columnId.value, position(previous.value.id), 'top'))
}

function moveDown() {
  if (next.value) moved(board.moveCard(card.id, columnId.value, position(next.value.id), 'bottom'))
}

function moveTo(targetColumnId: string) {
  const length = board.getColumnById(targetColumnId)?.cards.length ?? 0
  moved(board.moveCard(card.id, targetColumnId, length))
}

// The menu gives the focus back to its button, which goes away when the card changes columns.
function moved(success: boolean) {
  if (success) board.focusCard(card.id)
}
</script>

<template>
  <GsMenu>
    <template #trigger>
      <GsButton variant="icon" :aria-label="`Move ${card.title}`">
        <GsIcon size="small"><MoveIcon /></GsIcon>
      </GsButton>
    </template>
    <GsMenuItem label="Move up" :disabled="!previous" @select="moveUp" />
    <GsMenuItem label="Move down" :disabled="!next" @select="moveDown" />
    <template v-if="otherColumns.length">
      <GsMenuSeparator />
      <GsMenuSection title="Move to">
        <GsMenuItem
          v-for="column in otherColumns"
          :key="column.id"
          :label="column.title"
          :disabled="column.canDrop === false"
          @select="moveTo(column.id)"
        />
      </GsMenuSection>
    </template>
  </GsMenu>
</template>
