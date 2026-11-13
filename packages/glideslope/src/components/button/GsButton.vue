<script setup lang="ts">
/**
 * An accessible button with `filled`, `flat`, `outline` and `icon` variants.
 *
 * Any `GsIcon` in the default slot is sized to match the button. Native events such as `@click`
 * pass straight through to the rendered element.
 *
 * @example
 * ```vue
 * <GsButton color="accent" @click="save">Save</GsButton>
 *
 * <GsButton variant="icon" aria-label="Settings">
 *   <GsIcon><SettingsIcon /></GsIcon>
 * </GsButton>
 *
 * <!-- Render as another element or component -->
 * <GsButton as-child><RouterLink to="/home">Home</RouterLink></GsButton>
 * ```
 */
import { Primitive } from 'reka-ui'
import { computed } from 'vue'
import { provideIconDefaults } from '../icon/defaults'
import { injectButtonDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsButtonProps } from './types'

const {
  as = 'button',
  asChild = false,
  type = 'button',
  disabled = false,
  size,
  color,
  variant,
} = defineProps<GsButtonProps>()

defineSlots<{
  /** Button content: text, icons, or both. */
  default?: () => unknown
}>()

const defaults = injectButtonDefaults()
const resolvedSize = computed(() => size ?? defaults.value.size ?? 'medium')
const resolvedColor = computed(() => color ?? defaults.value.color ?? 'mono-muted')
const resolvedVariant = computed(() => variant ?? defaults.value.variant ?? 'filled')

/** Only a real `<button>` understands `type` and `disabled`; anything else gets ARIA instead. */
const isNativeButton = computed(() => !asChild && as === 'button')

provideIconDefaults(() => ({ size: resolvedSize.value }))
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    :type="isNativeButton ? type : undefined"
    :disabled="isNativeButton ? disabled : undefined"
    :aria-disabled="!isNativeButton && disabled ? 'true' : undefined"
    :data-disabled="disabled ? '' : undefined"
    :class="['group/button', styles.button, styles[resolvedVariant]]"
    :data-color="resolvedColor"
    :data-size="resolvedSize"
  >
    <slot />
  </Primitive>
</template>
