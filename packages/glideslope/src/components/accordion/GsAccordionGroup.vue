<script setup lang="ts">
/**
 * Stacks `GsAccordion` sections. Bind the open section's value with `v-model` (an array when
 * `multiple`).
 *
 * @example
 * ```vue
 * <GsAccordionGroup v-model="open" multiple>
 *   <GsAccordion value="sensors">…</GsAccordion>
 *   <GsAccordion value="comms">…</GsAccordion>
 * </GsAccordionGroup>
 * ```
 */
import { AccordionRoot } from 'reka-ui'
import { computed } from 'vue'
import { provideAccordionGroup } from './context'
import styles from './styles.module.css'
import type { GsAccordionGroupProps } from './types'

const {
  multiple = false,
  variant = 'cozy',
  disabled = false,
} = defineProps<GsAccordionGroupProps>()

/** The open section value, or values when `multiple`. */
const model = defineModel<string | string[]>()

defineSlots<{
  /** `GsAccordion` sections. */
  default?: () => unknown
}>()

provideAccordionGroup({
  variant: computed(() => variant),
  disabled: computed(() => disabled),
})
</script>

<template>
  <AccordionRoot
    v-model="model"
    :type="multiple ? 'multiple' : 'single'"
    collapsible
    :disabled="disabled"
    :class="['group/accordion-group', styles.group]"
  >
    <slot />
  </AccordionRoot>
</template>
