<script setup lang="ts">
/** The header of a card: a `GsKanbanCardHeaderTitle` and `GsKanbanCardHeaderActions`. */
import styles from './styles.module.css'

defineSlots<{
  /** The title and actions. */
  default?: () => unknown
}>()
</script>

<template>
  <div :class="[styles.header, styles.cardHeader]"><slot /></div>
</template>
