import { createDefaults } from '../../lib/defaults'
import type { GsSwitchDefaults } from './types'

export const [provideSwitchDefaults, injectSwitchDefaults] =
  createDefaults<GsSwitchDefaults>('GsSwitch')
