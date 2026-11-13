<script setup lang="ts">
/** The main text of a menu item. */
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <span :class="styles.label" data-slot="label"><slot /></span>
</template>
