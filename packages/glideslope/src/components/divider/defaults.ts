import { createDefaults } from '../../lib/defaults'
import type { GsDividerDefaults } from './types'

export const [provideDividerDefaults, injectDividerDefaults] =
  createDefaults<GsDividerDefaults>('GsDivider')
