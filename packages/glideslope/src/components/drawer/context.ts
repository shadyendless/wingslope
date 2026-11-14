import { inject, provide, type ComputedRef, type InjectionKey } from 'vue'
import type { GsDrawerPlacement } from './types'

export interface DrawerContext {
  placement: ComputedRef<GsDrawerPlacement>
  /** Menu items' element ids by the view they show, so a view's panel is labelled by its tab. */
  tabs: Map<string, string>
}

const key: InjectionKey<DrawerContext> = Symbol('GsDrawer')

export function provideDrawerContext(context: DrawerContext) {
  provide(key, context)
}

export function injectDrawerContext(): DrawerContext | undefined {
  return inject(key, undefined)
}
