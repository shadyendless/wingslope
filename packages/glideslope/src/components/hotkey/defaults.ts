import { createDefaults } from '../../lib/defaults'
import type { GsHotkeyDefaults } from './types'

export const [provideHotkeyDefaults, injectHotkeyDefaults] =
  createDefaults<GsHotkeyDefaults>('GsHotkey')
