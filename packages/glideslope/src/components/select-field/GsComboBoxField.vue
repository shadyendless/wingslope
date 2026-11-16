<script setup lang="ts">
/**
 * A labeled text input that filters a list of `GsOption` items as you type. Bind the selected
 * value with `v-model` and, optionally, the typed text with `v-model:search`.
 *
 * Options are filtered by their `label` (or `textValue`) and the matching text is highlighted;
 * `ignore-filter` leaves the filtering to you. With `allow-custom-value`, typed text that isn't an
 * option becomes the value. `class` and `style` apply to the field wrapper; other attributes go to
 * the `<input>`. `provideComboBoxFieldDefaults()` sets the `size`, `disabled`, `readonly` and
 * `clearable` of every combobox below a component.
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
import { computed, reactive, ref, useTemplateRef, watch } from 'vue'
import GsClearButton from '../button/GsClearButton.vue'
import GsFieldLayout from '../field/GsFieldLayout.vue'
import GsIcon from '../icon/GsIcon.vue'
import { provideOptionsContext } from '../options/context'
import GsOptionRegistry from '../options/GsOptionRegistry.vue'
import optionStyles from '../options/styles.module.css'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import styles from './combobox.module.css'
import { injectComboBoxFieldDefaults } from './defaults'
import type { GsComboBoxFieldProps } from './types'

defineOptions({ inheritAttrs: false })

const {
  label,
  description,
  errorMessage,
  size,
  invalid = false,
  disabled = undefined,
  required = false,
  name,
  validate,
  validationMode,
  placeholder,
  readonly = undefined,
  clearable = undefined,
  allowCustomValue = false,
  ignoreFilter = false,
  classes,
} = defineProps<GsComboBoxFieldProps>()

/** The selected option's value; with `allow-custom-value`, also a typed string. */
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
const control = useTemplateRef<{ $el: HTMLElement }>('control')

const defaults = injectComboBoxFieldDefaults()
const resolvedSize = computed(() => size ?? defaults.value.size ?? 'medium')
const isDisabled = computed(() => disabled ?? defaults.value.disabled ?? false)
const isReadonly = computed(() => readonly ?? defaults.value.readonly ?? false)
const isClearable = computed(() => clearable ?? defaults.value.clearable ?? true)

/** Option labels by value, so the input can show the selected option's label. */
const labels = reactive(new Map<AcceptableValue, string>())
/** The text the input shows for a value: its option's label, or the value itself. */
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
  () => displayValue(model.value),
  (text) => {
    if (!focused.value) search.value = text
  },
)

function registerLabel(value: AcceptableValue, text: string) {
  labels.set(value, text)
  return () => {
    // Keep the selected option's label when it leaves the list (e.g. filtered out by the app with
    // `ignore-filter`), so the input still shows it.
    if (value !== model.value && labels.get(value) === text) labels.delete(value)
  }
}

/**
 * With `allow-custom-value`, makes the typed text the value: the option with that label (ignoring
 * case) if there is one, otherwise the text itself. An empty input clears the value.
 */
function commitCustomValue(text: string) {
  if (text === displayValue(model.value)) return
  if (text === '') {
    model.value = null
    return
  }
  const needle = text.toLocaleLowerCase()
  const match = [...labels].find(([, optionLabel]) => optionLabel.toLocaleLowerCase() === needle)
  model.value = match ? match[0] : text
}

function onBlur(event: FocusEvent) {
  focused.value = false
  if (!allowCustomValue || isReadonly.value) return
  // Focus moving to the clear or list button, or into the list (clicking an option), stays in
  // the field: the option or button decides the value.
  const input = event.target as HTMLInputElement
  const next = event.relatedTarget as Node | null
  const listId = input.getAttribute('aria-controls')
  const list = listId ? document.getElementById(listId) : null
  if (next && (control.value?.$el.contains(next) || list?.contains(next))) return
  commitCustomValue(input.value)
}

function onEnter(event: KeyboardEvent) {
  // Reka UI has already chosen the highlighted option, and prevented the event, if there was one.
  if (!allowCustomValue || isReadonly.value || event.defaultPrevented || event.isComposing) return
  commitCustomValue((event.target as HTMLInputElement).value)
  open.value = false
}

provideOptionsContext({ kind: 'combobox' })
</script>

<template>
  <GsFieldLayout
    v-slot="{ ariaLabel }"
    v-bind="rootAttrs"
    :label="label"
    :description="isReadonly ? undefined : description"
    :error-message="errorMessage"
    :size="resolvedSize"
    :invalid="invalid"
    :disabled="isDisabled"
    :required="required"
    :name="name"
    :validate="validate"
    :validation-mode="validationMode"
    :classes="classes"
  >
    <ComboboxRoot
      v-model="model"
      v-model:open="open"
      :disabled="isDisabled"
      :name="name"
      :open-on-focus="!isReadonly"
      :open-on-click="!isReadonly"
      :ignore-filter="ignoreFilter"
      reset-model-value-on-clear
      :class="['group/combobox-field', styles.combobox]"
      :data-size="resolvedSize"
      :data-state="open ? 'open' : 'closed'"
      :data-empty="isEmpty ? '' : undefined"
    >
      <ComboboxAnchor
        ref="control"
        :class="[styles.control, classes?.control]"
        :data-readonly="isReadonly ? '' : undefined"
      >
        <FieldControl as-child>
          <ComboboxInput
            v-bind="controlAttrs"
            v-model="search"
            :aria-label="ariaLabel ?? controlAttrs['aria-label']"
            :placeholder="placeholder"
            :readonly="isReadonly"
            :title="isReadonly ? search : undefined"
            :display-value="displayValue"
            :class="[styles.input, classes?.input]"
            @focus="focused = true"
            @blur="onBlur"
            @keydown.enter="onEnter"
          />
        </FieldControl>
        <ComboboxCancel v-if="isClearable && !isReadonly" as-child>
          <!-- Reka UI empties the input element but not its model, which a re-render restores. -->
          <GsClearButton
            :class="[styles.clear, classes?.clear]"
            :disabled="isDisabled"
            @click="search = ''"
          />
        </ComboboxCancel>
        <ComboboxTrigger
          v-if="!isReadonly"
          :class="[styles.trigger, classes?.trigger]"
          aria-label="Show options"
        >
          <GsIcon size="small"><ChevronDownIcon /></GsIcon>
        </ComboboxTrigger>
      </ComboboxAnchor>
      <GsOptionRegistry :register="registerLabel"><slot /></GsOptionRegistry>
      <ComboboxPortal>
        <ComboboxContent
          position="popper"
          :side-offset="8"
          :class="['group/options', optionStyles.list, styles.popover, classes?.popover]"
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
