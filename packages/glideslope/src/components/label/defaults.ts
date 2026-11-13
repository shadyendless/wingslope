import { createDefaults } from '../../lib/defaults'
import type { GsLabelDefaults } from './types'

export const [provideLabelDefaults, injectLabelDefaults] =
  createDefaults<GsLabelDefaults>('GsLabel')
