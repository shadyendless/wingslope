<script setup lang="ts">
/**
 * Buttons at the end of a card's header, such as a menu or a `GsKanbanCardMoveMenu`. Pressing them
 * doesn't start a drag.
 */
import styles from './styles.module.css'

defineSlots<{
  /** Action buttons. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.cardHeaderActions"><slot /></div>
</template>
