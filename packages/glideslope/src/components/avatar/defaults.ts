import { createDefaults } from '../../lib/defaults'
import type { GsAvatarDefaults } from './types'

export const [provideAvatarDefaults, injectAvatarDefaults] =
  createDefaults<GsAvatarDefaults>('GsAvatar')
