<script setup lang="ts">
/** The collapsible content of a `GsAccordion`. */
import { AccordionContent } from 'reka-ui'
import styles from './styles.module.css'

defineSlots<{
  default?: () => unknown
}>()
</script>

<template>
  <AccordionContent :class="styles.panel">
    <div :class="styles.panelContent"><slot /></div>
  </AccordionContent>
</template>
