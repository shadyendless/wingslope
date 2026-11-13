import { inject, provide, type InjectionKey, type Ref } from 'vue'
import type { GsDialogSize } from './types'

const key: InjectionKey<Ref<GsDialogSize>> = Symbol('GsDialogSize')

export function provideDialogSize(size: Ref<GsDialogSize>) {
  provide(key, size)
}

export function injectDialogSize(): Ref<GsDialogSize> | undefined {
  return inject(key, undefined)
}
