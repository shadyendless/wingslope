import { createDefaults } from '../../lib/defaults'
import type { GsComboBoxFieldDefaults, GsSelectFieldDefaults } from './types'

export const [provideSelectFieldDefaults, injectSelectFieldDefaults] =
  createDefaults<GsSelectFieldDefaults>('GsSelectField')

export const [provideComboBoxFieldDefaults, injectComboBoxFieldDefaults] =
  createDefaults<GsComboBoxFieldDefaults>('GsComboBoxField')
