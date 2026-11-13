import { createDefaults } from '../../lib/defaults'
import type { GsTabDefaults, GsTabsDefaults } from './types'

export const [provideTabsDefaults, injectTabsDefaults] = createDefaults<GsTabsDefaults>('GsTabs')

/** `GsTabs` provides its `align` and `flex` this way; a nearer provider overrides them. */
export const [provideTabDefaults, injectTabDefaults] = createDefaults<GsTabDefaults>('GsTab')
