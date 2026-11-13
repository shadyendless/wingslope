import { computed, inject, provide, type ComputedRef, type InjectionKey } from 'vue'
import type { GsListVariant } from './types'

export interface ListContext {
  variant: ComputedRef<GsListVariant>
  selectable: ComputedRef<boolean>
  disabled: ComputedRef<boolean>
}

const key: InjectionKey<ListContext> = Symbol('GsList')

export function provideListContext(context: ListContext) {
  provide(key, context)
}

export function injectListContext(): ListContext {
  return inject(key, {
    variant: computed(() => 'cozy' as const),
    selectable: computed(() => false),
    disabled: computed(() => false),
  })
}
