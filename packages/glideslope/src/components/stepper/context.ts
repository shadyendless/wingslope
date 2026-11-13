import { inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import type { GsStepValue } from './types'

/** @internal State a `GsStepper` shares with its steps, panels and Back / Next buttons. */
export interface StepperContext {
  /** Registered step values, in render order. */
  steps: Readonly<Ref<readonly GsStepValue[]>>
  current: Readonly<Ref<GsStepValue | undefined>>
  completed: Readonly<Ref<readonly GsStepValue[]>>
  orientation: ComputedRef<'horizontal' | 'vertical'>
  register: (value: GsStepValue, id: string, disabled: () => boolean) => () => void
  isDisabled: (value: GsStepValue) => boolean
  /** The id of a step's button, to label its panel. */
  stepId: (value: GsStepValue) => string | undefined
  /** Moves to a step unless it is disabled, unknown, or `beforeStepChange` refuses. */
  goTo: (value: GsStepValue) => void
}

const key: InjectionKey<StepperContext> = Symbol('GsStepper')

export function provideStepperContext(context: StepperContext) {
  provide(key, context)
}

export function injectStepperContext(component: string): StepperContext {
  const context = inject(key, undefined)
  if (!context) throw new Error(`${component} must be used inside a GsStepper`)
  return context
}
