<script setup lang="ts">
/** Stacks a `GsOptionLabel` and `GsOptionDescription` next to an option's icon. */
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <div :class="styles.content"><slot /></div>
</template>
