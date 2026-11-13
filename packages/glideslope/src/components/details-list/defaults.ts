import { createDefaults } from '../../lib/defaults'
import type { GsDetailsListDefaults } from './types'

export const [provideDetailsListDefaults, injectDetailsListDefaults] =
  createDefaults<GsDetailsListDefaults>('GsDetailsList')
