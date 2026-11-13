import { createDefaults } from '../../lib/defaults'
import type { GsIconDefaults } from './types'

export const [provideIconDefaults, injectIconDefaults] = createDefaults<GsIconDefaults>('GsIcon')
