<script setup lang="ts">
/**
 * A list of selectable options (a listbox). Bind the selection with `v-model`. Give it an
 * accessible name with `aria-label` or `aria-labelledby`.
 *
 * The same `GsOption` items also go inside `GsSelectField` and `GsComboBoxField`.
 * `class` and `style` apply to the outer list; other attributes go to the `role="listbox"` element.
 *
 * @example
 * ```vue
 * <GsOptions v-model="affiliation" aria-label="Affiliation">
 *   <GsOption value="friend" label="Friend" />
 *   <GsOption value="hostile" label="Hostile" color="critical" />
 * </GsOptions>
 * ```
 */
import { ListboxContent, ListboxRoot, type AcceptableValue } from 'reka-ui'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import { provideOptionsContext } from './context'
import styles from './styles.module.css'
import type { GsOptionsProps } from './types'

defineOptions({ inheritAttrs: false })

const { multiple = false, disabled = false, size } = defineProps<GsOptionsProps>()

/** The selected value, or values when `multiple`. */
const model = defineModel<AcceptableValue | AcceptableValue[]>()

defineSlots<{
  /** `GsOption` and `GsOptionSection` items. */
  default?: () => unknown
}>()

const { rootAttrs, controlAttrs } = useSplitAttrs()

provideOptionsContext({ kind: 'listbox' })
</script>

<template>
  <ListboxRoot
    v-bind="rootAttrs"
    v-model="model"
    :multiple="multiple"
    :disabled="disabled"
    :class="['group/options', styles.list]"
    :data-size="size"
  >
    <ListboxContent v-bind="controlAttrs">
      <slot />
    </ListboxContent>
  </ListboxRoot>
</template>
