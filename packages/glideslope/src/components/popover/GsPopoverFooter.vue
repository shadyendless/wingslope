<script setup lang="ts">
/** Action row at the bottom of a `GsPopover`. Buttons inside default to the small size. */
import { provideButtonDefaults } from '../button/defaults'
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()

provideButtonDefaults({ size: 'small' })
</script>

<template>
  <footer :class="styles.footer"><slot /></footer>
</template>
