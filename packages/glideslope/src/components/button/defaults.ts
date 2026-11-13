import { createDefaults } from '../../lib/defaults'
import type { GsButtonDefaults, GsLinkButtonDefaults, GsToggleButtonDefaults } from './types'

export const [provideButtonDefaults, injectButtonDefaults] =
  createDefaults<GsButtonDefaults>('GsButton')

export const [provideLinkButtonDefaults, injectLinkButtonDefaults] =
  createDefaults<GsLinkButtonDefaults>('GsLinkButton')

export const [provideToggleButtonDefaults, injectToggleButtonDefaults] =
  createDefaults<GsToggleButtonDefaults>('GsToggleButton')
