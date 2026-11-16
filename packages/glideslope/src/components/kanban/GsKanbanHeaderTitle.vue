<script setup lang="ts">
/** The board's title, as a heading. */
import styles from './styles.module.css'
import type { GsKanbanHeaderTitleProps } from './types'

const { level = 3 } = defineProps<GsKanbanHeaderTitleProps>()

defineSlots<{
  /** The title text. */
  default?: () => unknown
}>()
</script>

<template>
  <component :is="`h${level}`" :class="styles.headerTitle"><slot /></component>
</template>
