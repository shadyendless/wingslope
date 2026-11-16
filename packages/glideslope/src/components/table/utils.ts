import type { RowData, Table, Updater } from '@tanstack/vue-table'
import type { GsMenuVariant } from '../menu/types'
import type { GsTableFeatures } from './features'
import type { GsTableMetaColumnId, GsTableVariant } from './types'

/** Width of the numeral, selection and kebab columns, which don't grow with the table. */
export const META_COLUMN_WIDTH = 32

const metaColumnIds: ReadonlySet<string> = new Set<GsTableMetaColumnId>([
  'numeral',
  'selection',
  'kebab',
])

/** Whether a column id is one of the table's own columns (numeral, selection, kebab). */
export function isMetaColumnId(columnId: string): boolean {
  return metaColumnIds.has(columnId)
}

/**
 * Ids of your columns in display order: every leaf column except the meta columns. Column moves
 * swap within this list, and `v-model:column-order` receives it.
 */
export function getConsumerColumnIds<TData extends RowData>(
  table: Table<GsTableFeatures, TData>,
): string[] {
  return table
    .getAllLeafColumns()
    .map(({ id }) => id)
    .filter((id) => !isMetaColumnId(id))
}

/** The menu density for a table density. Menus have no `crammed` step, so it maps to `compact`. */
export function toMenuVariant(variant: GsTableVariant): GsMenuVariant {
  return variant === 'crammed' ? 'compact' : variant
}

/** Resolves a TanStack updater (a value or a function of the previous value). */
export function resolveUpdater<T>(updater: Updater<T>, previous: T): T {
  return typeof updater === 'function' ? (updater as (old: T) => T)(previous) : updater
}

/**
 * Puts `data` in a manual row order: ranked rows go straight into their slot, the rest follow in
 * `data` order. Ids no longer in `data` are skipped, and duplicate ids fall through to the rest.
 */
export function orderRows<T extends { id: string | number }>(data: T[], order: string[]): T[] {
  if (!order.length) return data

  const rank = new Map(order.map((id, index) => [id, index]))
  const slots = Array.from<T | undefined>({ length: order.length })
  const unranked: T[] = []
  for (const item of data) {
    const slot = rank.get(String(item.id))
    if (slot === undefined || slots[slot] !== undefined) unranked.push(item)
    else slots[slot] = item
  }
  return [...slots.filter((item): item is T => item !== undefined), ...unranked]
}
