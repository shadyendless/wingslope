import { createDefaults } from '../../lib/defaults'
import type { GsClassificationBannerDefaults } from './types'

export const [provideClassificationBannerDefaults, injectClassificationBannerDefaults] =
  createDefaults<GsClassificationBannerDefaults>('GsClassificationBanner')
