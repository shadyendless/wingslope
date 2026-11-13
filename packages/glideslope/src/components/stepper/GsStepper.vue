<script setup lang="ts">
/**
 * A multi-step flow: `GsStepperList` with a `GsStepperStep` per step, a `GsStepperPanel` per step,
 * and `GsStepperBack` / `GsStepperNext` to move between them. Steps are identified by a `value`.
 *
 * Like the Design Toolkit's, the stepper is unstyled: style the steps with classes, using
 * `data-current`, `data-visited` and `data-disabled` (e.g. `data-current:bg-accent-primary-bold`).
 *
 * Moving forward marks the step you leave as visited (`v-model:completed`); moving back clears the
 * visited state from the step you return to onwards. `before-step-change` can block a move.
 *
 * @example
 * ```vue
 * <GsStepper v-model="step">
 *   <GsStepperList aria-label="Registration">
 *     <GsStepperStep value="details" class="h-[3px] w-full bg-surface-muted data-current:bg-accent-primary-bold" />
 *     <GsStepperStep value="review" class="h-[3px] w-full bg-surface-muted data-current:bg-accent-primary-bold" />
 *   </GsStepperList>
 *   <GsStepperPanel value="details">…<GsStepperNext /></GsStepperPanel>
 *   <GsStepperPanel value="review">…<GsStepperBack /></GsStepperPanel>
 * </GsStepper>
 * ```
 */
import { StepperRoot } from 'reka-ui'
import { computed, reactive, ref, watchEffect } from 'vue'
import { provideStepperContext } from './context'
import type { GsStepperProps, GsStepValue } from './types'

const {
  orientation = 'horizontal',
  defaultStep = undefined,
  beforeStepChange = undefined,
  disabledValues = undefined,
} = defineProps<GsStepperProps>()

/** The current step's value. Without `v-model`, starts at `default-step` or the first step. */
const current = defineModel<GsStepValue>()
/** Visited steps. Updated as you move; bind it to read it or to mark steps yourself. */
const completed = defineModel<GsStepValue[]>('completed', { default: () => [] })

defineSlots<{
  /** `GsStepperList`, `GsStepperPanel`s and any other content. */
  default?: () => unknown
}>()

interface RegisteredStep {
  id: string
  disabled: () => boolean
}

// Steps register in render order; the order defines "next" and "previous".
const registered = reactive(new Map<GsStepValue, RegisteredStep>())
const steps = ref<GsStepValue[]>([])

function register(value: GsStepValue, id: string, disabled: () => boolean) {
  registered.set(value, { id, disabled })
  if (!steps.value.includes(value)) steps.value = [...steps.value, value]
  return () => {
    registered.delete(value)
    steps.value = steps.value.filter((step) => step !== value)
  }
}

function isDisabled(value: GsStepValue) {
  return !!disabledValues?.includes(value) || !!registered.get(value)?.disabled()
}

function goTo(target: GsStepValue) {
  const from = current.value
  if (target === from || !steps.value.includes(target) || isDisabled(target)) return
  if (from !== undefined && beforeStepChange && !beforeStepChange(from, target)) return

  if (from !== undefined) {
    const fromIndex = steps.value.indexOf(from)
    const toIndex = steps.value.indexOf(target)
    const visited = new Set(completed.value)
    if (toIndex > fromIndex) {
      visited.add(from)
      visited.delete(target)
    } else {
      for (const step of steps.value.slice(toIndex)) visited.delete(step)
    }
    completed.value = steps.value.filter((step) => visited.has(step))
  }
  current.value = target
}

// Start on `default-step`, or the first step, when nothing is selected.
watchEffect(() => {
  if (current.value !== undefined || steps.value.length === 0) return
  const start =
    defaultStep !== undefined && steps.value.includes(defaultStep) ? defaultStep : steps.value[0]
  if (start !== undefined) current.value = start
})

// Reka's stepper works with 1-based positions.
const position = computed(() =>
  current.value === undefined ? undefined : steps.value.indexOf(current.value) + 1 || undefined,
)

function onRekaChange(next: number | undefined) {
  const target = next === undefined ? undefined : steps.value[next - 1]
  if (target !== undefined) goTo(target)
}

provideStepperContext({
  steps,
  current,
  completed,
  orientation: computed(() => orientation),
  register,
  isDisabled,
  stepId: (value) => registered.get(value)?.id,
  goTo,
})
</script>

<template>
  <StepperRoot
    :model-value="position"
    :orientation="orientation"
    :linear="false"
    :data-orientation="orientation"
    @update:model-value="onRekaChange"
  >
    <slot />
  </StepperRoot>
</template>
