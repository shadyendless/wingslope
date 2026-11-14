import { computed, inject, provide, type ComputedRef, type InjectionKey, type Ref } from 'vue'
import { injectTableDefaults } from './defaults'
import type { GsTableVariant } from './types'

/** @internal Options of a data-driven `GsTable` that its header and body parts read. */
export interface TableOptions {
  persistHeaderKebabMenu: boolean
  persistRowKebabMenu: boolean
  persistNumerals: boolean
  displayNumerals: boolean
  enableSorting: boolean
  enableColumnReordering: boolean
  enableRowActions: boolean
}

/** @internal State `GsTable` shares with its parts. */
export interface TableContext {
  variant: ComputedRef<GsTableVariant>
  /** Whether the table renders itself from `columns` and `data` (rather than from markup). */
  dataDriven: ComputedRef<boolean>
  options: ComputedRef<TableOptions>
  /** The column whose header menu is open. Its header and cells are highlighted. */
  columnSelection: Ref<string | null>
  /** Swaps a column with its neighbor among your columns (the meta columns never move). */
  moveColumn: (columnId: string, offset: -1 | 1) => void
  /** Sorts by one column, or clears the sort with `null`. */
  setSort: (columnId: string, direction: 'asc' | 'desc' | null) => void
}

const key: InjectionKey<TableContext> = Symbol('GsTable')

export function provideTableContext(context: TableContext) {
  provide(key, context)
}

export function injectTableContext(): TableContext | undefined {
  return inject(key, undefined)
}

/** @internal For parts that a data-driven `GsTable` renders itself. */
export function requireTableContext(): TableContext {
  const context = injectTableContext()
  if (!context) throw new Error('This table part must be rendered by a GsTable.')
  return context
}

/** The table's density, for parts that may also render in a plain `<table>`. */
export function injectTableVariant(): ComputedRef<GsTableVariant> {
  const table = injectTableContext()
  const defaults = injectTableDefaults()
  return computed(() => table?.variant.value ?? defaults.value.variant ?? 'cozy')
}
