import { inject, provide, type ComputedRef, type InjectionKey } from 'vue'

export interface DetailsListContext {
  labelClass: ComputedRef<unknown[]>
  valueClass: ComputedRef<unknown[]>
}

const key: InjectionKey<DetailsListContext> = Symbol('GsDetailsList')

export function provideDetailsListContext(context: DetailsListContext) {
  provide(key, context)
}

export function injectDetailsListContext(): DetailsListContext | undefined {
  return inject(key, undefined)
}
