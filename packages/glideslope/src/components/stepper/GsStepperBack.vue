<script setup lang="ts">
/**
 * Goes to the previous step. Disabled on the first step and when the previous step is disabled. A
 * `GsButton`: button props and classes apply.
 */
import { computed } from 'vue'
import GsButton from '../button/GsButton.vue'
import { injectStepperContext } from './context'

const slots = defineSlots<{
  /** Button content. @default 'Back' */
  default?: () => unknown
}>()

const stepper = injectStepperContext('GsStepperBack')
const target = computed(() => {
  const index =
    stepper.current.value === undefined ? -1 : stepper.steps.value.indexOf(stepper.current.value)
  return index <= 0 ? undefined : stepper.steps.value[index - 1]
})
const blocked = computed(() => target.value === undefined || stepper.isDisabled(target.value))

function back() {
  if (target.value !== undefined) stepper.goTo(target.value)
}
</script>

<template>
  <GsButton
    :disabled="blocked"
    :aria-label="slots.default ? undefined : 'Go to previous step'"
    @click="back"
  >
    <slot>Back</slot>
  </GsButton>
</template>
