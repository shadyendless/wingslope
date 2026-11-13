import { createDefaults } from '../../lib/defaults'
import type { GsLabelPosition } from './types'

/** Shared by checkbox and radio groups to pass `labelPosition` to their items. */
export const [provideChoiceDefaults, injectChoiceDefaults] = createDefaults<{
  labelPosition?: GsLabelPosition
}>('GsChoice')
