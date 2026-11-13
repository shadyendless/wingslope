<script setup lang="ts">
/**
 * A compact floating bar of icon actions, e.g. map tools. Buttons and toggle buttons inside default
 * to the icon variant at the bar's size. Give the bar an `aria-label`.
 *
 * @example
 * ```vue
 * <GsActionBar aria-label="Map tools">
 *   <GsToggleButton v-model="measuring" aria-label="Measure"><GsIcon><LineToolIcon /></GsIcon></GsToggleButton>
 *   <GsButton aria-label="Zoom in"><GsIcon><ZoomInIcon /></GsIcon></GsButton>
 * </GsActionBar>
 * ```
 */
import { provideButtonDefaults, provideToggleButtonDefaults } from '../button/defaults'
import styles from './styles.module.css'

const { size = 'medium', elevation = 'overlay' } = defineProps<{
  /** @default 'medium' */
  size?: 'medium' | 'small'
  /**
   * Shadow depth: `flat` (no shadow) for a bar embedded in a panel that already has a visual
   * boundary, `overlay` for one floating over content, `raised` for more prominence.
   * @default 'overlay'
   */
  elevation?: 'flat' | 'overlay' | 'raised'
}>()

defineSlots<{
  /** `GsButton` and `GsToggleButton` actions. */
  default?: () => unknown
}>()

provideButtonDefaults(() => ({ size, variant: 'icon' }))
provideToggleButtonDefaults(() => ({ size, variant: 'icon' }))
</script>

<template>
  <nav :class="styles.bar" :data-size="size" :data-elevation="elevation"><slot /></nav>
</template>
