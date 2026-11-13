import { createDefaults } from '../../lib/defaults'
import type { GsBadgeDefaults } from './types'

export const [provideBadgeDefaults, injectBadgeDefaults] =
  createDefaults<GsBadgeDefaults>('GsBadge')
