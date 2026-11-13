<script setup lang="ts">
/**
 * Form field label. Marks optional fields with "(optional)" rather than marking required ones.
 *
 * Inside a Glideslope field (or any Reka UI `FieldRoot`) it is wired to the field's control
 * automatically and follows the field's `disabled` / `required` state.
 *
 * @example
 * ```vue
 * <GsLabel for="email" required>Email</GsLabel>
 * ```
 */
import { FieldLabel, Label, injectFieldRootContext } from 'reka-ui'
import { computed } from 'vue'
import styles from './styles.module.css'
import type { GsLabelProps } from './types'

const {
  for: htmlFor,
  disabled = undefined,
  required = undefined,
  nativeLabel = true,
} = defineProps<GsLabelProps>()

defineSlots<{
  /** Label text. */
  default?: () => unknown
}>()

const field = injectFieldRootContext(null)

const isDisabled = computed(() => disabled ?? field?.disabled.value ?? false)
const isRequired = computed(() => required ?? field?.required.value ?? false)
</script>

<template>
  <FieldLabel
    v-if="field"
    :native-label="nativeLabel"
    :class="['group/label', styles.label]"
    :data-disabled="isDisabled ? '' : undefined"
    :data-required="isRequired ? '' : undefined"
  >
    <slot />
    <template v-if="!isRequired"> (optional)</template>
  </FieldLabel>
  <Label
    v-else
    :for="htmlFor"
    :class="['group/label', styles.label]"
    :data-disabled="isDisabled ? '' : undefined"
    :data-required="isRequired ? '' : undefined"
  >
    <slot />
    <template v-if="!isRequired"> (optional)</template>
  </Label>
</template>
