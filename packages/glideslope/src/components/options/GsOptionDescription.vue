<script setup lang="ts">
/** Secondary text under a `GsOptionLabel`. Not shown in a select's trigger. */
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <span :class="styles.description"><slot /></span>
</template>
