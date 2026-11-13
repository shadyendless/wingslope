<script setup lang="ts">
/** Secondary text under a `GsListItemTitle`. */
import { injectListContext } from './context'
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()

const list = injectListContext()
</script>

<template>
  <div :class="[styles.description, styles[list.variant.value]]"><slot /></div>
</template>
