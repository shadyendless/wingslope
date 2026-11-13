<script setup lang="ts">
/**
 * @internal Shared layout for Glideslope fields: Reka UI `FieldRoot` plus label, control slot,
 * description and error. Label, description and error are wired to the control through
 * `aria-labelledby` / `aria-describedby` by Reka UI.
 */
import { FieldDescription, FieldError, FieldRoot } from 'reka-ui'
import GsLabel from '../label/GsLabel.vue'
import styles from './styles.module.css'
import type { GsFieldProps } from './types'

const {
  label,
  description,
  errorMessage,
  size = 'medium',
  invalid = false,
  disabled = false,
  required = false,
  name,
  validate,
  validationMode,
  nativeLabel = true,
} = defineProps<
  GsFieldProps & {
    /** Render the label as a native `<label>`. `false` for button-like controls. */
    nativeLabel?: boolean
  }
>()

defineSlots<{
  /** The control. `ariaLabel` is set when the visible label is hidden (small size). */
  default?: (props: { invalid: boolean; ariaLabel: string | undefined }) => unknown
}>()
</script>

<template>
  <FieldRoot
    v-slot="{ invalid: isInvalid }"
    :name="name"
    :disabled="disabled"
    :required="required"
    :invalid="invalid || !!errorMessage"
    :validate="validate"
    :validation-mode="validationMode"
    :class="['group/field', styles.field]"
    :data-size="size"
  >
    <GsLabel v-if="label && size !== 'small'" :native-label="nativeLabel">{{ label }}</GsLabel>
    <slot :invalid="isInvalid" :aria-label="size === 'small' ? label : undefined" />
    <FieldDescription
      v-if="description && size !== 'small' && !isInvalid"
      :class="styles.description"
    >
      {{ description }}
    </FieldDescription>
    <FieldError v-slot="{ errors }" :class="styles.error">
      {{ errorMessage || errors.join(' ') }}
    </FieldError>
  </FieldRoot>
</template>
