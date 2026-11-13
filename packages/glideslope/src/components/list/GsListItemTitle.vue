<script setup lang="ts">
/** The main text of a `GsListItem`. */
import { injectListContext } from './context'
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()

const list = injectListContext()
</script>

<template>
  <div :class="[styles.title, styles[list.variant.value]]"><slot /></div>
</template>
