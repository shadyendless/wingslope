<script setup lang="ts">
/** Action row at the bottom of a `GsDialog`. Buttons inside match the dialog's size. */
import { provideButtonDefaults } from '../button/defaults'
import { injectDialogSize } from './context'
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()

const size = injectDialogSize()
provideButtonDefaults(() => ({ size: size?.value === 'large' ? 'medium' : 'small' }))
</script>

<template>
  <footer :class="styles.footer"><slot /></footer>
</template>
