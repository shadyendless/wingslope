<script setup lang="ts">
/**
 * A link styled as a button. Use it for navigation; use `GsButton` for actions.
 *
 * @example
 * ```vue
 * <GsLinkButton href="/reports" variant="outline">Reports</GsLinkButton>
 *
 * <!-- With Vue Router -->
 * <GsLinkButton as-child><RouterLink to="/reports">Reports</RouterLink></GsLinkButton>
 * ```
 */
import { Primitive } from 'reka-ui'
import { computed } from 'vue'
import { useDisabledLink } from '../../lib/use-disabled-link'
import { provideIconDefaults } from '../icon/defaults'
import { injectLinkButtonDefaults } from './defaults'
import styles from './styles.module.css'
import type { GsLinkButtonProps } from './types'

const {
  as = 'a',
  asChild = false,
  href,
  disabled = false,
  size,
  color,
  variant,
} = defineProps<GsLinkButtonProps>()

defineSlots<{
  /** Link content: text, icons, or both. */
  default?: () => unknown
}>()

const defaults = injectLinkButtonDefaults()
const resolvedSize = computed(() => size ?? defaults.value.size ?? 'medium')
const resolvedColor = computed(() => color ?? defaults.value.color ?? 'mono-muted')
const resolvedVariant = computed(() => variant ?? defaults.value.variant ?? 'filled')

const { linkAttrs, guardClick } = useDisabledLink(
  () => href,
  () => disabled,
)

provideIconDefaults(() => ({ size: resolvedSize.value }))
</script>

<template>
  <Primitive
    :as="as"
    :as-child="asChild"
    v-bind="linkAttrs"
    :class="['group/button', styles.button, styles[resolvedVariant]]"
    :data-color="resolvedColor"
    :data-size="resolvedSize"
    @click="guardClick"
  >
    <slot />
  </Primitive>
</template>
