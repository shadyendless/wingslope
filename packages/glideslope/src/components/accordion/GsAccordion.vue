<script setup lang="ts">
/**
 * A section that expands and collapses. Use it on its own (bind `v-model:open`), or inside a
 * `GsAccordionGroup`.
 *
 * @example
 * ```vue
 * <GsAccordion v-model:open="showSensors">
 *   <GsAccordionHeader>
 *     <GsAccordionTrigger>Sensors</GsAccordionTrigger>
 *   </GsAccordionHeader>
 *   <GsAccordionPanel>Radar, EO/IR, ESM</GsAccordionPanel>
 * </GsAccordion>
 * ```
 */
import { AccordionItem, AccordionRoot } from 'reka-ui'
import { computed, useId } from 'vue'
import { injectAccordionGroup, provideAccordionItem } from './context'
import styles from './styles.module.css'
import type { GsAccordionProps } from './types'

const { value, variant, disabled = false } = defineProps<GsAccordionProps>()

/** Open state when used on its own. Inside a group, the group's model controls it. */
const open = defineModel<boolean>('open', { default: false })

defineSlots<{
  /** A `GsAccordionHeader` and a `GsAccordionPanel`. */
  default?: () => unknown
}>()

const group = injectAccordionGroup()
const itemValue = value ?? useId()
const resolvedVariant = computed(() => variant ?? group?.variant.value ?? 'cozy')
const isDisabled = computed(() => disabled || (group?.disabled.value ?? false))

/** A standalone accordion is a single-item Reka accordion. */
const standaloneValue = computed({
  get: () => (open.value ? itemValue : undefined),
  set: (next: string | string[] | undefined) => (open.value = next === itemValue),
})

provideAccordionItem({ variant: resolvedVariant, disabled: isDisabled })
</script>

<template>
  <AccordionItem
    v-if="group"
    :value="itemValue"
    :disabled="isDisabled"
    :class="['group/accordion', styles.accordion]"
  >
    <slot />
  </AccordionItem>
  <AccordionRoot v-else v-model="standaloneValue" type="single" collapsible :disabled="isDisabled">
    <AccordionItem :value="itemValue" :class="['group/accordion', styles.accordion]">
      <slot />
    </AccordionItem>
  </AccordionRoot>
</template>
