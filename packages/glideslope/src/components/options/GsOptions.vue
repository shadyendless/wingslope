<script setup lang="ts">
/**
 * A list of options (a listbox). Bind the selection with `v-model`, or set
 * `selection-mode="none"` for a list of actions and listen to each option's `@action`. Give it an
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
import { computed } from 'vue'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import { provideOptionsContext } from './context'
import styles from './styles.module.css'
import type { GsOptionsProps } from './types'

defineOptions({ inheritAttrs: false })

const { selectionMode = 'single', disabled = false, size } = defineProps<GsOptionsProps>()

/** The selected value, or values with `selection-mode="multiple"`. Unused with `none`. */
const model = defineModel<AcceptableValue | AcceptableValue[]>()

defineSlots<{
  /** `GsOption` and `GsOptionSection` items. */
  default?: () => unknown
}>()

const { rootAttrs, controlAttrs } = useSplitAttrs()

const selectable = computed(() => selectionMode !== 'none')

provideOptionsContext({
  kind: 'listbox',
  selectable,
  disabled: computed(() => disabled),
})
</script>

<template>
  <ListboxRoot
    v-bind="rootAttrs"
    :model-value="selectable ? model : undefined"
    :multiple="selectionMode === 'multiple'"
    :disabled="disabled"
    :class="['group/options', styles.list]"
    :data-size="size"
    @update:model-value="(value) => (model = value)"
  >
    <ListboxContent v-bind="controlAttrs">
      <slot />
    </ListboxContent>
  </ListboxRoot>
</template>
