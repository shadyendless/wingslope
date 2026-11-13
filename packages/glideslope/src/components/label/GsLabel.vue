<script setup lang="ts">
/**
 * Form field label. Marks optional fields with "(optional)" rather than marking required ones.
 *
 * @example
 * ```vue
 * <GsLabel for="email" required>Email</GsLabel>
 * ```
 */
import { Label } from 'reka-ui'
import styles from './styles.module.css'
import type { GsLabelProps } from './types'

const { for: htmlFor, disabled = false, required = false } = defineProps<GsLabelProps>()

defineSlots<{
  /** Label text. */
  default?: () => unknown
}>()
</script>

<template>
  <Label
    :for="htmlFor"
    :class="['group/label', styles.label]"
    :data-disabled="disabled ? '' : undefined"
    :data-required="required ? '' : undefined"
  >
    <slot />
    <template v-if="!required"> (optional)</template>
  </Label>
</template>
