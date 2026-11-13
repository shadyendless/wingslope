<script setup lang="ts">
/** The content of one step, rendered only while that step is current. Unstyled. */
import { computed } from 'vue'
import { injectStepperContext } from './context'
import type { GsStepperPanelProps } from './types'

const { value } = defineProps<GsStepperPanelProps>()

defineSlots<{
  default?: () => unknown
}>()

const stepper = injectStepperContext('GsStepperPanel')
const isCurrent = computed(() => stepper.current.value === value)
</script>

<template>
  <div
    v-if="isCurrent"
    role="group"
    tabindex="-1"
    :aria-labelledby="stepper.stepId(value)"
    data-current=""
  >
    <slot />
  </div>
</template>
