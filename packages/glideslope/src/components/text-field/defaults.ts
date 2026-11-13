import { createDefaults } from '../../lib/defaults'
import type { GsSearchFieldDefaults, GsTextAreaFieldDefaults, GsTextFieldDefaults } from './types'

export const [provideTextFieldDefaults, injectTextFieldDefaults] =
  createDefaults<GsTextFieldDefaults>('GsTextField')

export const [provideTextAreaFieldDefaults, injectTextAreaFieldDefaults] =
  createDefaults<GsTextAreaFieldDefaults>('GsTextAreaField')

export const [provideSearchFieldDefaults, injectSearchFieldDefaults] =
  createDefaults<GsSearchFieldDefaults>('GsSearchField')
