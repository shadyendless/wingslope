<script setup lang="ts">
/** Holds the `GsTab`s. Give it an `aria-label` describing the set of tabs. */
import { TabsList } from 'reka-ui'
import styles from './styles.module.css'

defineSlots<{
  /** `GsTab` items. */
  default?: () => unknown
}>()
</script>

<template>
  <TabsList :class="styles.list"><slot /></TabsList>
</template>
