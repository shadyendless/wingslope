<script setup lang="ts">
/**
 * Holds the `GsStepperStep`s, as a `nav` landmark: give it an `aria-label`. Arrow keys move focus
 * between steps; Enter or Space selects one. Unstyled; lay it out with classes (e.g. `flex gap-m`).
 */
import { injectStepperContext } from './context'

defineSlots<{
  /** `GsStepperStep`s. */
  default?: () => unknown
}>()

const stepper = injectStepperContext('GsStepperList')
</script>

<template>
  <nav :data-orientation="stepper.orientation.value"><slot /></nav>
</template>
