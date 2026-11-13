import type { AcceptableValue } from 'reka-ui'
import { inject, provide, type InjectionKey, type Ref } from 'vue'

/**
 * Which Reka UI collection the options belong to. `registry` is a render-less pass in which
 * options only report their labels (see `GsOptionRegistry`).
 */
export type OptionsKind = 'select' | 'combobox' | 'listbox' | 'registry'

export interface OptionsContext {
  kind: OptionsKind
  /** `false` in a `GsOptions` with `selection-mode="none"`: choosing an option emits `action`. */
  selectable?: Readonly<Ref<boolean>>
  /** The whole list is disabled. */
  disabled?: Readonly<Ref<boolean>>
  /** Lets a combobox show the label of the selected value in its input. */
  registerLabel?: (value: AcceptableValue, label: string) => () => void
}

const key: InjectionKey<OptionsContext> = Symbol('GsOptions')

export function provideOptionsContext(context: OptionsContext) {
  provide(key, context)
}

export function injectOptionsContext(): OptionsContext {
  return inject(key, { kind: 'listbox' })
}
