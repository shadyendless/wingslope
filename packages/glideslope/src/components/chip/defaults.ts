import { inject, provide, type InjectionKey } from 'vue'
import { createDefaults } from '../../lib/defaults'
import type { GsChipStyleProps } from './types'

export const [provideChipDefaults, injectChipDefaults] = createDefaults<GsChipStyleProps>('GsChip')

const inListKey: InjectionKey<boolean> = Symbol('GsChipList')

/** Marks descendants as living inside a `GsChipList` (a Reka UI `TagGroupRoot`). */
export function provideInChipList() {
  provide(inListKey, true)
}

export function injectInChipList(): boolean {
  return inject(inListKey, false)
}
