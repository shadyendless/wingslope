import { createDefaults } from '../../lib/defaults'
import type { GsCoordinateFieldDefaults } from './types'

export const [provideCoordinateFieldDefaults, injectCoordinateFieldDefaults] =
  createDefaults<GsCoordinateFieldDefaults>('GsCoordinateField')
