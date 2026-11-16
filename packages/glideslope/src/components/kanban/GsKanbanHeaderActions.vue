<script setup lang="ts">
/** Buttons and a `GsKanbanHeaderSearch` at the end of the board's header. */
import styles from './styles.module.css'

defineSlots<{
  /** Action buttons and the search field. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.headerActions"><slot /></div>
</template>
