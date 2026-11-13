<script setup lang="ts">
/** Stacks a `GsListItemTitle` and `GsListItemDescription` beside a row's icon. */
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.content"><slot /></div>
</template>
