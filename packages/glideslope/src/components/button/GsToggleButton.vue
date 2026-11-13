<script setup lang="ts">
/**
 * A button that toggles between pressed and unpressed. Bind the pressed state with `v-model`.
 *
 * Built on Reka UI's `Toggle`, so it exposes `aria-pressed` and `data-state="on" | "off"`.
 *
 * @example
 * ```vue
 * <GsToggleButton v-model="isBold" variant="icon" aria-label="Bold">
 *   <GsIcon><BoldIcon /></GsIcon>
 * </GsToggleButton>
 * ```
 */
import { Toggle } from 'reka-ui'
import { computed } from 'vue'
import { provideIconDefaults } from '../icon/defaults'
import { injectToggleButtonDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsToggleButtonProps } from './types'

const {
  as = 'button',
  asChild = false,
  disabled = false,
  size,
  color,
  variant,
} = defineProps<GsToggleButtonProps>()

/** Pressed state. Works uncontrolled too: without `v-model` the state is kept locally. */
const pressed = defineModel<boolean>({ default: false })

defineSlots<{
  /** Button content. The slot receives the current pressed state. */
  default?: (props: { pressed: boolean }) => unknown
}>()

const defaults = injectToggleButtonDefaults()
const resolvedSize = computed(() => size ?? defaults.value.size ?? 'medium')
const resolvedColor = computed(() => color ?? defaults.value.color ?? 'mono-muted')
const resolvedVariant = computed(() => variant ?? defaults.value.variant ?? 'flat')

provideIconDefaults(() => ({ size: resolvedSize.value }))
</script>

<template>
  <Toggle
    v-model="pressed"
    :as="as"
    :as-child="asChild"
    :disabled="disabled"
    :class="['group/button', styles.button, styles.toggle, styles[resolvedVariant]]"
    :data-color="resolvedColor"
    :data-size="resolvedSize"
  >
    <slot :pressed="pressed" />
  </Toggle>
</template>
