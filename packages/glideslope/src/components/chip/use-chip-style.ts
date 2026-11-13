import { computed } from 'vue'
import { provideIconDefaults } from '../icon/defaults'
import { injectChipDefaults } from './defaults'
import type { GsChipStyleProps } from './types'

/** Resolves a chip's color and size against list defaults, and sizes icons inside it. */
export function useChipStyle(props: () => GsChipStyleProps) {
  const defaults = injectChipDefaults()
  const color = computed(() => props().color ?? defaults.value.color ?? 'info')
  const size = computed(() => props().size ?? defaults.value.size ?? 'medium')

  provideIconDefaults(() => ({ size: size.value === 'medium' ? 'small' : 'xsmall' }))

  return { color, size }
}
