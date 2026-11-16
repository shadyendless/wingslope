<script setup lang="ts">
/** The title of a column. It also names the column for assistive technology. */
import { useId } from 'vue'
import { useKanbanColumnTitle } from './context'
import styles from './styles.module.css'

defineSlots<{
  /** The title text. */
  default?: () => unknown
}>()

const id = useId()
useKanbanColumnTitle(id)
</script>

<template>
  <span :id="id" :class="styles.columnTitle"><slot /></span>
</template>
