<script setup lang="ts">
/**
 * Lays out the keys of one keyboard shortcut and sizes any key icons inside it.
 */
import { provideIconDefaults } from '../icon/defaults'
import styles from './styles.module.css'

defineSlots<{
  /** `GsHotkey` elements and separators such as "+" or "then". */
  default?: () => unknown
}>()

provideIconDefaults({ size: 'large' })
</script>

<template>
  <div :class="styles.set"><slot /></div>
</template>
