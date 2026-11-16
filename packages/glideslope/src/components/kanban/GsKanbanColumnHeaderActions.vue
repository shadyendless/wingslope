<script setup lang="ts">
/** The end of a column's header: a badge with the column's card count, then any buttons. */
import GsBadge from '../badge/GsBadge.vue'
import styles from './styles.module.css'
import type { GsKanbanColumnHeaderActionsProps } from './types'

const { cardCount = 0 } = defineProps<GsKanbanColumnHeaderActionsProps>()

defineSlots<{
  /** Buttons after the count. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.columnHeaderActions">
    <GsBadge>{{ cardCount }}</GsBadge>
    <slot />
  </div>
</template>
