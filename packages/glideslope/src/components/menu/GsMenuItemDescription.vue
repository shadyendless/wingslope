<script setup lang="ts">
/** Secondary text under a menu item's label. */
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <span :class="styles.description" data-slot="description"><slot /></span>
</template>
