<script setup lang="ts">
/**
 * A labeled dropdown for choosing from a list of `GsOption` items. Bind the selection with
 * `v-model`.
 *
 * `class` and `style` apply to the field wrapper; other attributes go to the trigger button.
 * `provideSelectFieldDefaults()` sets the `size`, `disabled` and `readonly` of every select below
 * a component.
 *
 * @example
 * ```vue
 * <GsSelectField v-model="affiliation" label="Affiliation" placeholder="Choose one">
 *   <GsOption value="friend" label="Friend" />
 *   <GsOption value="hostile" label="Hostile" color="critical" />
 * </GsSelectField>
 * ```
 */
import ChevronDownIcon from '@wingbrace/glideslope-icons/chevron-down'
import {
  SelectContent,
  SelectPortal,
  SelectRoot,
  SelectTrigger,
  SelectValue,
  SelectViewport,
  type AcceptableValue,
} from 'reka-ui'
import { computed } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsFieldLayout from '../field/GsFieldLayout.vue'
import GsIcon from '../icon/GsIcon.vue'
import { provideOptionsContext } from '../options/context'
import optionStyles from '../options/styles.module.css'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import { injectSelectFieldDefaults } from './defaults'
import styles from './select.module.css'
import type { GsSelectFieldProps } from './types'

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
  multiple = false,
  classes,
} = defineProps<GsSelectFieldProps>()

/** The selected value, or values when `multiple`. */
const model = defineModel<AcceptableValue | AcceptableValue[]>()

defineSlots<{
  /** `GsOption` and `GsOptionSection` items. */
  default?: () => unknown
}>()

const { rootAttrs, controlAttrs } = useSplitAttrs()

const defaults = injectSelectFieldDefaults()
const resolvedSize = computed(() => size ?? defaults.value.size ?? 'medium')
const isDisabled = computed(() => disabled ?? defaults.value.disabled ?? false)
const isReadonly = computed(() => readonly ?? defaults.value.readonly ?? false)

provideOptionsContext({ kind: 'select' })
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
    :disabled="isDisabled || isReadonly"
    :required="required"
    :name="name"
    :validate="validate"
    :validation-mode="validationMode"
    :native-label="false"
    :classes="classes"
  >
    <SelectRoot
      v-model="model"
      :disabled="isDisabled || isReadonly"
      :required="required"
      :name="name"
      :multiple="multiple"
    >
      <SelectTrigger
        v-if="isReadonly"
        :class="[styles.readonly, classes?.trigger]"
        :aria-label="ariaLabel ?? controlAttrs['aria-label']"
      >
        <SelectValue :placeholder="placeholder" :class="[styles.value, classes?.value]" />
      </SelectTrigger>
      <SelectTrigger v-else as-child>
        <GsButton
          v-bind="controlAttrs"
          :aria-label="ariaLabel ?? controlAttrs['aria-label']"
          variant="outline"
          :size="resolvedSize"
          :class="[styles.trigger, classes?.trigger]"
        >
          <SelectValue :placeholder="placeholder" :class="[styles.value, classes?.value]" />
          <GsIcon :class="styles.chevron"><ChevronDownIcon /></GsIcon>
        </GsButton>
      </SelectTrigger>
      <SelectPortal>
        <SelectContent
          position="popper"
          :side-offset="4"
          :class="['group/options', optionStyles.list, styles.popover, classes?.popover]"
        >
          <SelectViewport>
            <slot />
          </SelectViewport>
        </SelectContent>
      </SelectPortal>
    </SelectRoot>
  </GsFieldLayout>
</template>
