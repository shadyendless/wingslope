import { createDefaults } from '../../lib/defaults'
import type { GsTableDefaults } from './types'

/**
 * Sets the `variant` of every `GsTable` below the caller that doesn't set its own, and of table
 * parts composed into a plain `<table>`.
 *
 * @example
 * ```ts
 * provideTableDefaults({ variant: 'compact' })
 * ```
 */
export const [provideTableDefaults, injectTableDefaults] =
  createDefaults<GsTableDefaults>('GsTable')
