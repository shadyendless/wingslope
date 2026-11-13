<script setup lang="ts">
/**
 * A labeled text input that filters a list of `GsOption` items as you type. Bind the selected
 * value with `v-model` and, optionally, the typed text with `v-model:search`.
 *
 * Options are filtered by their `label` (or `textValue`) and the matching text is highlighted.
 * `class` and `style` apply to the field wrapper; other attributes go to the `<input>`.
 *
 * @example
 * ```vue
 * <GsComboBoxField v-model="airport" label="Destination" placeholder="Search airports">
 *   <GsOption value="KDEN" label="Denver International" />
 *   <GsOption value="KSEA" label="Seattle-Tacoma International" />
 * </GsComboBoxField>
 * ```
 */
import ChevronDownIcon from '@wingbrace/glideslope-icons/chevron-down'
import {
  ComboboxAnchor,
  ComboboxCancel,
  ComboboxContent,
  ComboboxEmpty,
  ComboboxInput,
  ComboboxPortal,
  ComboboxRoot,
  ComboboxTrigger,
  ComboboxViewport,
  FieldControl,
  type AcceptableValue,
} from 'reka-ui'
import { computed, reactive, ref, watch } from 'vue'
import GsClearButton from '../button/GsClearButton.vue'
import GsFieldLayout from '../field/GsFieldLayout.vue'
import GsIcon from '../icon/GsIcon.vue'
import { provideOptionsContext } from '../options/context'
import GsOptionRegistry from '../options/GsOptionRegistry.vue'
import optionStyles from '../options/styles.module.css'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import styles from './combobox.module.css'
import type { GsComboBoxFieldProps } from './types'

defineOptions({ inheritAttrs: false })

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
  placeholder,
  readonly = false,
  clearable = true,
} = defineProps<GsComboBoxFieldProps>()

/** The selected value. */
const model = defineModel<AcceptableValue>()
/** The text typed into the input. */
const search = defineModel<string>('search', { default: '' })

defineSlots<{
  /** `GsOption` and `GsOptionSection` items. */
  default?: () => unknown
  /** Shown when no option matches the search. */
  empty?: () => unknown
}>()

const { rootAttrs, controlAttrs } = useSplitAttrs()
const open = ref(false)

/** Option labels by value, so the input can show the selected option's label. */
const labels = reactive(new Map<AcceptableValue, string>())
const displayValue = (value: AcceptableValue | undefined) =>
  value == null ? '' : (labels.get(value) ?? (typeof value === 'object' ? '' : String(value)))

const isEmpty = computed(() => search.value === '')

/**
 * Reka UI only formats the input when the selection changes, which can happen before the options
 * have registered their labels (e.g. an initial value). Show the label once it is known, unless
 * the user is typing.
 */
const focused = ref(false)
watch(
  () => (model.value == null ? undefined : labels.get(model.value)),
  (selectedLabel) => {
    if (selectedLabel !== undefined && !focused.value) search.value = selectedLabel
  },
)

function registerLabel(value: AcceptableValue, text: string) {
  labels.set(value, text)
  return () => labels.delete(value)
}

provideOptionsContext({ kind: 'combobox' })
</script>

<template>
  <GsFieldLayout
    v-slot="{ ariaLabel }"
    v-bind="rootAttrs"
    :label="label"
    :description="readonly ? undefined : description"
    :error-message="errorMessage"
    :size="size"
    :invalid="invalid"
    :disabled="disabled"
    :required="required"
    :name="name"
    :validate="validate"
    :validation-mode="validationMode"
  >
    <ComboboxRoot
      v-model="model"
      v-model:open="open"
      :disabled="disabled"
      :name="name"
      :open-on-focus="!readonly"
      :open-on-click="!readonly"
      reset-model-value-on-clear
      :class="['group/combobox-field', styles.combobox]"
      :data-size="size"
      :data-state="open ? 'open' : 'closed'"
      :data-empty="isEmpty ? '' : undefined"
    >
      <ComboboxAnchor :class="styles.control" :data-readonly="readonly ? '' : undefined">
        <FieldControl as-child>
          <ComboboxInput
            v-bind="controlAttrs"
            v-model="search"
            :aria-label="ariaLabel ?? controlAttrs['aria-label']"
            :placeholder="placeholder"
            :readonly="readonly"
            :display-value="displayValue"
            :class="styles.input"
            @focus="focused = true"
            @blur="focused = false"
          />
        </FieldControl>
        <ComboboxCancel v-if="clearable && !readonly" as-child>
          <GsClearButton :class="styles.clear" :disabled="disabled" />
        </ComboboxCancel>
        <ComboboxTrigger v-if="!readonly" :class="styles.trigger" aria-label="Show options">
          <GsIcon size="small"><ChevronDownIcon /></GsIcon>
        </ComboboxTrigger>
      </ComboboxAnchor>
      <GsOptionRegistry :register="registerLabel"><slot /></GsOptionRegistry>
      <ComboboxPortal>
        <ComboboxContent
          position="popper"
          :side-offset="4"
          :class="['group/options', optionStyles.list, styles.popover]"
        >
          <ComboboxViewport>
            <slot />
          </ComboboxViewport>
          <ComboboxEmpty :class="styles.empty">
            <slot name="empty">No matches</slot>
          </ComboboxEmpty>
        </ComboboxContent>
      </ComboboxPortal>
    </ComboboxRoot>
  </GsFieldLayout>
</template>
