<script setup lang="ts">
/**
 * A text input with optional prefix/suffix content and a clear button. Bind the value with
 * `v-model`.
 *
 * `class` and `style` apply to the outer container; every other attribute (`id`, `name`,
 * `autocomplete`, `aria-*`, listeners) goes to the `<input>`. Inside a Glideslope field (or a
 * Reka UI `FieldRoot`) it registers as the field's control, so labels, descriptions, errors and
 * validation are wired up automatically.
 *
 * @example
 * ```vue
 * <GsInput v-model="callsign" placeholder="Callsign" aria-label="Callsign">
 *   <template #prefix>#</template>
 * </GsInput>
 * ```
 */
import { FieldControl, injectFieldRootContext } from 'reka-ui'
import { computed, useTemplateRef, type ComponentPublicInstance } from 'vue'
import GsClearButton from '../button/GsClearButton.vue'
import { provideIconDefaults } from '../icon/defaults'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import styles from './styles.module.css'
import type { GsInputProps } from './types'

defineOptions({ inheritAttrs: false })

const {
  size = 'medium',
  type = 'text',
  placeholder,
  disabled = false,
  readonly = false,
  required = false,
  invalid = false,
  clearable = true,
  autoSize = false,
  classes,
} = defineProps<GsInputProps>()

/** The input value. */
const model = defineModel<string | number>({ default: '' })

const slots = defineSlots<{
  /** Content before the input, e.g. a unit or icon. */
  prefix?: () => unknown
  /** Content after the input. */
  suffix?: () => unknown
}>()

const field = injectFieldRootContext(null)
const { rootAttrs, controlAttrs } = useSplitAttrs()

const control = useTemplateRef<HTMLInputElement | ComponentPublicInstance>('control')
const inputElement = () => {
  const el = control.value
  return el instanceof HTMLElement ? el : (el?.$el as HTMLInputElement | undefined)
}

const isDisabled = computed(() => disabled || (field?.disabled.value ?? false))
const isInvalid = computed(() => invalid || (field?.invalid.value ?? false))
const isEmpty = computed(() => model.value === '' || model.value == null)
const isClearable = computed(() => clearable && !readonly)
const length = computed(() => String(model.value ?? '').length || placeholder?.length || 0)

/** Value bindings differ: Reka's FieldControl owns the native `input` event inside a field. */
const valueBindings = computed(() =>
  field
    ? {
        modelValue: model.value,
        'onUpdate:modelValue': (value: string) => (model.value = value),
      }
    : {
        value: model.value,
        onInput: (event: Event) => (model.value = (event.target as HTMLInputElement).value),
      },
)

function clear() {
  model.value = ''
  inputElement()?.focus()
}

function onKeydown(event: KeyboardEvent) {
  if (event.key === 'Escape' && isClearable.value && !isEmpty.value && !event.defaultPrevented) {
    model.value = ''
  }
}

provideIconDefaults({ size: 'small' })
</script>

<template>
  <div
    v-bind="rootAttrs"
    :class="[
      'group/input',
      styles.container,
      {
        [styles.hasPrefix ?? '']: !!slots.prefix,
        [styles.hasSuffix ?? '']: !!slots.suffix,
        [styles.isClearable ?? '']: isClearable,
      },
    ]"
    :style="{ '--length': length }"
    :data-size="size"
    :data-disabled="isDisabled ? '' : undefined"
    :data-invalid="isInvalid ? '' : undefined"
    :data-readonly="readonly ? '' : undefined"
    :data-required="required ? '' : undefined"
    :data-empty="isEmpty ? '' : undefined"
  >
    <span v-if="slots.prefix" :class="[styles.prefix, classes?.prefix]"
      ><slot name="prefix"
    /></span>
    <div :class="[styles.sizer, classes?.sizer, { [styles.autoSize ?? '']: autoSize }]">
      <component
        :is="field ? FieldControl : 'input'"
        ref="control"
        v-bind="{ ...controlAttrs, ...valueBindings }"
        :class="[styles.input, classes?.input]"
        :type="type"
        :title="model ? String(model) : undefined"
        :placeholder="placeholder"
        :disabled="isDisabled"
        :readonly="readonly"
        :required="required"
        :aria-invalid="!field && isInvalid ? 'true' : undefined"
        @keydown="onKeydown"
      />
    </div>
    <span
      v-if="slots.suffix"
      :class="[
        styles.suffix,
        classes?.suffix,
        { [styles.hasSuffix ?? '']: true, [styles.isClearable ?? '']: isClearable },
      ]"
    >
      <slot name="suffix" />
    </span>
    <GsClearButton
      v-if="isClearable"
      :class="[
        styles.clear,
        classes?.clear,
        { [styles.hasSuffix ?? '']: !!slots.suffix, [styles.isClearable ?? '']: true },
      ]"
      :disabled="isDisabled"
      @click="clear"
    />
  </div>
</template>
