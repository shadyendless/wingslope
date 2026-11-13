<script setup lang="ts">
/** The heading button that expands and collapses its `GsAccordion`. */
import ChevronDownIcon from '@wingbrace/glideslope-icons/chevron-down'
import { AccordionHeader, AccordionTrigger } from 'reka-ui'
import { provideButtonDefaults } from '../button/defaults'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import { injectAccordionItem } from './context'
import styles from './styles.module.css'
import type { GsAccordionTriggerProps } from './types'

const { level = 3, classes } = defineProps<GsAccordionTriggerProps>()

defineSlots<{
  /** Section title. */
  default?: () => unknown
}>()

const item = injectAccordionItem()
// The header's button defaults are for its action buttons, not for this trigger.
provideButtonDefaults({})
</script>

<template>
  <AccordionHeader :as="`h${level}`" :class="[styles.heading, classes?.heading]">
    <AccordionTrigger as-child>
      <GsButton
        variant="flat"
        :class="[styles.trigger, styles[item?.variant.value ?? 'cozy'], classes?.trigger]"
      >
        <GsIcon :size="item?.variant.value === 'compact' ? 'small' : 'medium'">
          <ChevronDownIcon :class="styles.triggerChevron" />
        </GsIcon>
        <slot />
      </GsButton>
    </AccordionTrigger>
  </AccordionHeader>
</template>
