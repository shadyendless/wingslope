<script setup lang="ts">
/**
 * The header of a column: a `GsKanbanColumnHeaderTitle` (with an optional
 * `GsKanbanColumnHeaderDragHandle`) and `GsKanbanColumnHeaderActions`.
 */
import styles from './styles.module.css'

defineSlots<{
  /** The title, drag handle and actions. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.columnHeader"><slot /></div>
</template>
