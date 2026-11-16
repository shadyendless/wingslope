import { createDefaults } from '../../lib/defaults'
import type { GsClassificationBadgeDefaults } from './types'

export const [provideClassificationBadgeDefaults, injectClassificationBadgeDefaults] =
  createDefaults<GsClassificationBadgeDefaults>('GsClassificationBadge')
