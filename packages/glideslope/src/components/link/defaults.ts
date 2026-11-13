import { createDefaults } from '../../lib/defaults'
import type { GsLinkDefaults } from './types'

export const [provideLinkDefaults, injectLinkDefaults] = createDefaults<GsLinkDefaults>('GsLink')
