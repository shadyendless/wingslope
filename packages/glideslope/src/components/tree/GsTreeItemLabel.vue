<script setup lang="ts">
/**
 * The main text of a `GsTree` row. Spans both lines of the row when no `GsTreeItemDescription`
 * follows it.
 */
import { useId } from 'vue'
import { useTreeRowText } from './context'
import styles from './styles.module.css'

defineSlots<{
  /** Label text. */
  default?: () => unknown
}>()

const id = useId()
useTreeRowText(id)
</script>

<template>
  <div :id="id" :class="styles.label"><slot /></div>
</template>
