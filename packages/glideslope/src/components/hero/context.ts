import { inject, provide, type ComputedRef, type InjectionKey } from 'vue'

export interface HeroContext {
  titleClass: ComputedRef<unknown[]>
  subtitleClass: ComputedRef<unknown[]>
}

const key: InjectionKey<HeroContext> = Symbol('GsHero')

export function provideHeroContext(context: HeroContext) {
  provide(key, context)
}

export function injectHeroContext(): HeroContext | undefined {
  return inject(key, undefined)
}
