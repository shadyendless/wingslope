import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import type {
  ColumnOrderState,
  ColumnSizingState,
  RowPinningState,
  RowSelectionState,
  SortingState,
} from '@tanstack/vue-table'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref, type Component, type Ref } from 'vue'
import GsPagination from '../pagination/GsPagination.vue'
import { provideTableDefaults } from './defaults'
import { createTableColumnHelper } from './features'
import GsTable from './GsTable.vue'
import GsTableBody from './GsTableBody.vue'
import GsTableCell from './GsTableCell.vue'
import GsTableHeader from './GsTableHeader.vue'
import GsTableHeaderCell from './GsTableHeaderCell.vue'
import GsTableRow from './GsTableRow.vue'
import type { GsTableCellSlotProps, GsTableVariant } from './types'

type Person = { id: string; name: string; age: number }

const helper = createTableColumnHelper<Person>()
const personColumns = [
  helper.accessor('name', { id: 'name', header: () => h('span', 'Name') }),
  helper.accessor('age', { id: 'age', header: () => 'Age', cell: (info) => info.renderValue() }),
]
const people: Person[] = [
  { id: 'tanner', name: 'tanner', age: 24 },
  { id: 'tandy', name: 'tandy', age: 40 },
  { id: 'joe', name: 'joe', age: 45 },
]

type Props = Record<string, unknown>
type Slots = Record<string, (props: never) => unknown>

/** Renders a data-driven table. Props may hold refs, read on every render. */
function renderTable(props: Props | (() => Props) = {}, slots?: Slots) {
  return render(() =>
    h(
      GsTable as Component,
      { columns: personColumns, data: people, ...(typeof props === 'function' ? props() : props) },
      slots,
    ),
  )
}

/** A `v-model:<name>` binding whose parent state is a ref. */
function model<T>(name: string, initial: T) {
  const value = ref(initial) as Ref<T>
  const onUpdate = vi.fn((next: T) => (value.value = next))
  return { value, onUpdate, bind: () => ({ [name]: value.value, [`onUpdate:${name}`]: onUpdate }) }
}

/** Data rows (the header row skipped), as their text with digits and spaces removed. */
function dataRowNames() {
  return screen
    .getAllByRole('row')
    .slice(1)
    .map((row) => row.textContent?.replace(/[^a-z-]/g, ''))
}

function rowCheckboxes() {
  // The first checkbox is the header's select-all.
  return screen.getAllByRole('checkbox').slice(1)
}

function columnHeader(text: string) {
  return screen.getAllByRole('columnheader').find((th) => th.textContent?.includes(text))!
}

function headerTexts() {
  return screen.getAllByRole('columnheader').map((th) => th.textContent)
}

async function chooseRowAction(rowNumber: number, item: string) {
  await userEvent.click(screen.getByRole('button', { name: `Row ${rowNumber} actions` }))
  await userEvent.click(await screen.findByRole('menuitem', { name: item }))
}

async function chooseColumnAction(column: string, item: string) {
  await userEvent.click(screen.getByRole('button', { name: `${column} column actions` }))
  await userEvent.click(await screen.findByRole('menuitem', { name: item }))
}

async function openColumnMenu(column: string) {
  await userEvent.click(screen.getByRole('button', { name: `${column} column actions` }))
  return screen.findByRole('menu')
}

describe('GsTable in markup', () => {
  const markup = (props: Props = {}) =>
    h(GsTable as Component, props, () => [
      h(GsTableHeader, null, () =>
        h(GsTableRow, null, () => [
          h(GsTableHeaderCell, null, () => 'Header 1'),
          h(GsTableHeaderCell, null, () => 'Header 2'),
        ]),
      ),
      h(GsTableBody, null, () =>
        h(GsTableRow, null, () => [
          h(GsTableCell, null, () => 'Cell 1'),
          h(GsTableCell, null, () => 'Cell 2'),
        ]),
      ),
    ])

  it('renders its parts as a native table', () => {
    render(() => markup())
    expect(screen.getByRole('table')).toBeInTheDocument()
    expect(screen.getAllByRole('columnheader').map((th) => th.textContent)).toEqual([
      'Header 1',
      'Header 2',
    ])
    expect(screen.getAllByRole('cell').map((td) => td.textContent)).toEqual(['Cell 1', 'Cell 2'])
    // No column menus, row actions or meta columns without `columns`.
    expect(screen.queryByRole('button')).not.toBeInTheDocument()
  })

  it('applies its variant to the parts', () => {
    render(() => markup({ variant: 'crammed' }))
    expect(screen.getByText('Header 1').closest('div')).toHaveClass('headerCell', 'crammed')
    expect(screen.getByRole('cell', { name: 'Cell 1' })).toHaveClass('cell', 'crammed')
  })

  it('emits row clicks, and preventDefault keeps a data row from toggling', async () => {
    const onClick = vi.fn((event: MouseEvent) => event.preventDefault())
    render(() =>
      h(
        'table',
        null,
        h(GsTableBody, null, () => h(GsTableRow, { onClick }, () => 'test cell')),
      ),
    )
    await userEvent.click(screen.getByRole('row'))
    expect(onClick).toHaveBeenCalledOnce()
    expect(onClick.mock.calls[0]?.[0].defaultPrevented).toBe(true)
  })

  it('renders cozy parts in a plain table, or the provided variant', () => {
    const Host = defineComponent({
      props: { variant: { type: String, default: undefined } },
      setup(props) {
        if (props.variant) provideTableDefaults({ variant: props.variant as GsTableVariant })
        return () =>
          h('table', null, [
            h(GsTableHeader, null, () =>
              h(GsTableRow, null, () => h(GsTableHeaderCell, null, () => 'Callsign')),
            ),
            h(GsTableBody, null, () =>
              h(GsTableRow, null, () => h(GsTableCell, null, () => 'AF1')),
            ),
          ])
      },
    })
    const first = render(Host)
    expect(screen.getByRole('cell')).toHaveClass('cozy')
    first.unmount()

    render(Host, { props: { variant: 'compact' } })
    expect(screen.getByRole('cell')).toHaveClass('compact')
    expect(screen.getByText('Callsign').closest('div')).toHaveClass('compact')
  })
})

describe('GsTable data updates', () => {
  it('reflects data changes without remounting', async () => {
    const data = ref(people.slice(0, 2))
    renderTable(() => ({ data: data.value }))
    expect(screen.getByText('tanner')).toBeInTheDocument()

    data.value = [
      { id: 'tandy', name: 'tandy-updated', age: 1 },
      { id: 'joe', name: 'joe', age: 2 },
    ]
    expect(await screen.findByText('tandy-updated')).toBeInTheDocument()
    expect(screen.getByText('joe')).toBeInTheDocument()
    expect(screen.queryByText('tanner')).not.toBeInTheDocument()
  })

  it('keeps a manual row order across data updates', async () => {
    const data = ref(people)
    renderTable(() => ({ data: data.value, enableSorting: false }))
    await chooseRowAction(1, 'Move Down')
    expect(dataRowNames()).toEqual(['tandy', 'tanner', 'joe'])

    data.value = people.map((person) => ({ ...person, name: `${person.name}-live` }))
    await waitFor(() => expect(dataRowNames()).toEqual(['tandy-live', 'tanner-live', 'joe-live']))
  })

  it('moves a row up from its menu', async () => {
    renderTable()
    await chooseRowAction(2, 'Move Up')
    expect(dataRowNames()).toEqual(['tandy', 'tanner', 'joe'])
  })

  it('disables moving the first row up', async () => {
    renderTable()
    await userEvent.click(screen.getByRole('button', { name: 'Row 1 actions' }))
    expect(await screen.findByRole('menuitem', { name: 'Move Up' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('menuitem', { name: 'Move Down' })).not.toHaveAttribute('aria-disabled')
  })

  it('disables Move Up when only pinned rows are above, and skips pinned neighbors', async () => {
    renderTable()
    await chooseRowAction(1, 'Pin')
    await userEvent.click(screen.getByRole('button', { name: 'Row 2 actions' }))
    expect(await screen.findByRole('menuitem', { name: 'Move Up' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    await userEvent.keyboard('{Escape}')

    // Joe skips pinned tanner, so it lands above tandy.
    await chooseRowAction(3, 'Move Up')
    expect(dataRowNames()).toEqual(['tanner', 'joe', 'tandy'])
  })

  it('moves the selected rows as a group', async () => {
    renderTable({ showCheckbox: true })
    await userEvent.click(rowCheckboxes()[0]!)
    await userEvent.click(rowCheckboxes()[1]!)
    await chooseRowAction(1, 'Move Down')
    expect(dataRowNames()).toEqual(['joe', 'tanner', 'tandy'])
  })

  it('keeps an open row menu open across data updates', async () => {
    const data = ref(people)
    renderTable(() => ({ data: data.value }))
    await userEvent.click(screen.getByRole('button', { name: 'Row 1 actions' }))
    expect(await screen.findByRole('menuitem', { name: 'Move Down' })).toBeInTheDocument()

    data.value = people.map((person) => ({ ...person, name: `${person.name}-live` }))
    expect(await screen.findByText('tanner-live')).toBeInTheDocument()
    expect(screen.getByRole('menuitem', { name: 'Move Down' })).toBeInTheDocument()
  })
})

describe('GsTable row selection', () => {
  it('names the checkboxes', () => {
    renderTable({ showCheckbox: true })
    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toBeInTheDocument()
    expect(screen.getByRole('checkbox', { name: 'Select row 2' })).toBeInTheDocument()
  })

  it('reflects v-model:row-selection changes after mount', async () => {
    const selection = model<RowSelectionState>('rowSelection', { tanner: true })
    renderTable(() => ({ showCheckbox: true, ...selection.bind() }))
    expect(rowCheckboxes()[0]).toBeChecked()

    selection.value.value = {}
    await waitFor(() => expect(rowCheckboxes()[0]).not.toBeChecked())
  })

  it('starts from default-row-selection and updates without a binding', async () => {
    renderTable({ showCheckbox: true, defaultRowSelection: { tanner: true, joe: true } })
    expect(rowCheckboxes().map((box) => box.getAttribute('aria-checked'))).toEqual([
      'true',
      'false',
      'true',
    ])
    await userEvent.click(rowCheckboxes()[1]!)
    expect(rowCheckboxes()[1]).toBeChecked()
  })

  it('emits the plain next selection, without deselected keys', async () => {
    const selection = model<RowSelectionState>('rowSelection', { tanner: true, joe: true })
    renderTable(() => ({ showCheckbox: true, ...selection.bind() }))
    await userEvent.click(rowCheckboxes()[2]!)
    expect(selection.onUpdate).toHaveBeenCalledExactlyOnceWith({ tanner: true })

    await userEvent.click(rowCheckboxes()[1]!)
    expect(selection.onUpdate).toHaveBeenLastCalledWith({ tanner: true, tandy: true })
  })

  it('selects every row from the header checkbox, which shows a partial selection', async () => {
    const selection = model<RowSelectionState>('rowSelection', { tanner: true })
    renderTable(() => ({ showCheckbox: true, ...selection.bind() }))
    const all = screen.getByRole('checkbox', { name: 'Select all rows' })
    expect(all).toHaveAttribute('aria-checked', 'mixed')

    await userEvent.click(all)
    expect(selection.onUpdate).toHaveBeenCalledWith({ tanner: true, tandy: true, joe: true })
    expect(all).toBeChecked()

    await userEvent.click(all)
    expect(selection.onUpdate).toHaveBeenLastCalledWith({})
  })

  it('ignores default-row-selection while bound', () => {
    renderTable({
      showCheckbox: true,
      rowSelection: { joe: true },
      defaultRowSelection: { tanner: true },
    })
    expect(rowCheckboxes()[0]).not.toBeChecked()
    expect(rowCheckboxes()[2]).toBeChecked()
  })

  it('toggles a row when it is clicked', async () => {
    const selection = model<RowSelectionState>('rowSelection', {})
    renderTable(() => ({ showCheckbox: true, ...selection.bind() }))
    const row = screen.getAllByRole('row')[1]!
    await userEvent.click(row)
    expect(selection.onUpdate).toHaveBeenCalledExactlyOnceWith({ tanner: true })
    expect(row).toHaveAttribute('data-selected')
    expect(rowCheckboxes()[0]).toBeChecked()

    await userEvent.click(row)
    expect(row).not.toHaveAttribute('data-selected')
  })

  it('keeps checkbox and row menu clicks from toggling the row', async () => {
    const selection = model<RowSelectionState>('rowSelection', {})
    renderTable(() => ({ showCheckbox: true, ...selection.bind() }))
    await userEvent.click(rowCheckboxes()[0]!)
    expect(selection.onUpdate).toHaveBeenCalledExactlyOnceWith({ tanner: true })

    await userEvent.click(screen.getByRole('button', { name: 'Row 2 actions' }))
    await userEvent.keyboard('{Escape}')
    expect(selection.onUpdate).toHaveBeenCalledOnce()
  })

  it('reaches the row controls with Tab and works them from the keyboard', async () => {
    const selection = model<RowSelectionState>('rowSelection', {})
    renderTable(() => ({
      showCheckbox: true,
      enableSorting: false,
      enableColumnReordering: false,
      ...selection.bind(),
    }))
    await userEvent.tab()
    expect(screen.getByRole('checkbox', { name: 'Select all rows' })).toHaveFocus()
    await userEvent.tab()
    expect(screen.getByRole('checkbox', { name: 'Select row 1' })).toHaveFocus()
    await userEvent.keyboard(' ')
    expect(selection.onUpdate).toHaveBeenCalledExactlyOnceWith({ tanner: true })

    await userEvent.tab()
    expect(screen.getByRole('button', { name: 'Row 1 actions' })).toHaveFocus()
    await userEvent.keyboard('{Enter}')
    expect(await screen.findByRole('menuitem', { name: 'Pin' })).toBeInTheDocument()
    expect(selection.onUpdate).toHaveBeenCalledOnce()
  })
})

describe('GsTable sorting', () => {
  it('names each column menu by its header and leaves meta columns without one', () => {
    renderTable({ showCheckbox: true })
    expect(screen.getByRole('button', { name: 'Name column actions' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Age column actions' })).toBeInTheDocument()
    expect(screen.getAllByRole('button', { name: /column actions$/ })).toHaveLength(2)
  })

  it('emits the plain sort for descending, ascending and clear', async () => {
    const sort = model<SortingState>('sort', [])
    renderTable(() => sort.bind())
    await chooseColumnAction('Age', 'Sort Descending')
    expect(sort.onUpdate).toHaveBeenLastCalledWith([{ id: 'age', desc: true }])
    expect(dataRowNames()).toEqual(['joe', 'tandy', 'tanner'])

    await chooseColumnAction('Age', 'Sort Ascending')
    expect(sort.onUpdate).toHaveBeenLastCalledWith([{ id: 'age', desc: false }])

    await chooseColumnAction('Age', 'Clear Sort')
    expect(sort.onUpdate).toHaveBeenLastCalledWith([])
    expect(sort.onUpdate).toHaveBeenCalledTimes(3)
  })

  it('replaces the sorted column when sorting by another', async () => {
    const sort = model<SortingState>('sort', [])
    renderTable(() => sort.bind())
    await chooseColumnAction('Age', 'Sort Descending')
    await chooseColumnAction('Name', 'Sort Ascending')
    expect(sort.onUpdate).toHaveBeenLastCalledWith([{ id: 'name', desc: false }])
  })

  it('starts from default-sort and sets aria-sort', () => {
    renderTable({ defaultSort: [{ id: 'age', desc: true }] })
    expect(dataRowNames()).toEqual(['joe', 'tandy', 'tanner'])
    expect(columnHeader('Age')).toHaveAttribute('aria-sort', 'descending')
    expect(columnHeader('Name')).not.toHaveAttribute('aria-sort')
  })

  it('reflects v-model:sort changes after mount', async () => {
    const sort = model<SortingState>('sort', [])
    renderTable(() => sort.bind())
    expect(dataRowNames()).toEqual(['tanner', 'tandy', 'joe'])

    sort.value.value = [{ id: 'name', desc: false }]
    await waitFor(() => expect(dataRowNames()).toEqual(['joe', 'tandy', 'tanner']))
    expect(columnHeader('Name')).toHaveAttribute('aria-sort', 'ascending')
  })

  it('shows the sort without reordering rows with manual-sorting', async () => {
    renderTable({ manualSorting: true, sort: [{ id: 'age', desc: true }] })
    expect(dataRowNames()).toEqual(['tanner', 'tandy', 'joe'])
    expect(columnHeader('Age')).toHaveAttribute('aria-sort', 'descending')

    const menu = await openColumnMenu('Age')
    expect(within(menu).getByRole('menuitem', { name: 'Sort Descending' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(within(menu).getByRole('menuitem', { name: 'Clear Sort' })).not.toHaveAttribute(
      'aria-disabled',
    )
  })

  it('disables Clear Sort on an unsorted column', async () => {
    renderTable()
    const menu = await openColumnMenu('Age')
    expect(within(menu).getByRole('menuitem', { name: 'Clear Sort' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(within(menu).getByRole('menuitem', { name: 'Sort Ascending' })).not.toHaveAttribute(
      'aria-disabled',
    )
  })

  it('does not sort when a header label is clicked', async () => {
    renderTable()
    await userEvent.click(screen.getByText('Age'))
    for (const th of screen.getAllByRole('columnheader'))
      expect(th).not.toHaveAttribute('aria-sort')
    expect(dataRowNames()).toEqual(['tanner', 'tandy', 'joe'])
  })

  it('leaves out the sort items without enable-sorting, and the menu without either feature', async () => {
    const first = renderTable({ enableSorting: false })
    const menu = await openColumnMenu('Age')
    expect(within(menu).getByRole('menuitem', { name: 'Move Column Left' })).toBeInTheDocument()
    expect(within(menu).queryByRole('menuitem', { name: /Sort/ })).not.toBeInTheDocument()
    expect(within(menu).queryByRole('separator')).not.toBeInTheDocument()
    await userEvent.keyboard('{Escape}')
    first.unmount()

    renderTable({ enableSorting: false, enableColumnReordering: false })
    expect(screen.queryByRole('button', { name: /column actions/ })).not.toBeInTheDocument()
  })

  it('highlights the column while its menu is open', async () => {
    const { container } = renderTable()
    // The open menu hides the table from the accessibility tree, so query the DOM.
    const ageCells = () => [...container.querySelectorAll('tr')].map((tr) => tr.children[2])
    await openColumnMenu('Age')
    const [header, ...cells] = ageCells()
    expect(header?.firstElementChild).toHaveAttribute('data-selected')
    for (const cell of cells) expect(cell).toHaveAttribute('data-selected')
    expect(container.querySelectorAll('tr')[1]?.children[1]).not.toHaveAttribute('data-selected')

    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(ageCells()[1]).not.toHaveAttribute('data-selected'))
  })

  it('shows the sort direction on the menu button in place of the kebab', () => {
    renderTable({ defaultSort: [{ id: 'age', desc: true }] })
    const sorted = screen.getByRole('button', { name: 'Age column actions' })
    const unsorted = screen.getByRole('button', { name: 'Name column actions' })
    expect(sorted.innerHTML).not.toEqual(unsorted.innerHTML)
  })
})

describe('GsTable row pinning', () => {
  function dataRowPins() {
    return screen
      .getAllByRole('row')
      .slice(1)
      .map((row) => row.getAttribute('data-pinned'))
  }

  it('starts from default-row-pinning and marks pinned rows', () => {
    renderTable({ defaultRowPinning: { top: ['joe'], bottom: [] } })
    expect(dataRowNames()).toEqual(['joe', 'tanner', 'tandy'])
    expect(dataRowPins()).toEqual(['top', null, null])
    expect(screen.getByRole('img', { name: 'Pinned' })).toBeInTheDocument()
  })

  it('emits the plain next pinning on Pin and Unpin', async () => {
    const pinning = model<RowPinningState>('rowPinning', { top: ['joe'], bottom: [] })
    renderTable(() => pinning.bind())
    // Tanner keeps its data index, so its menu is still "Row 1" while joe renders first.
    await chooseRowAction(1, 'Pin')
    expect(pinning.onUpdate).toHaveBeenLastCalledWith({ top: ['joe', 'tanner'], bottom: [] })

    await chooseRowAction(3, 'Unpin')
    expect(pinning.onUpdate).toHaveBeenLastCalledWith({ top: ['tanner'], bottom: [] })
  })

  it('reflects v-model:row-pinning changes after mount', async () => {
    const pinning = model<RowPinningState>('rowPinning', { top: ['joe'], bottom: [] })
    renderTable(() => pinning.bind())
    expect(dataRowPins()).toEqual(['top', null, null])

    pinning.value.value = { top: [], bottom: [] }
    await waitFor(() => expect(dataRowPins()).toEqual([null, null, null]))
  })

  it('skips pinned ids that are not in the data, without removing them', () => {
    const pinning = model<RowPinningState>('rowPinning', { top: ['ghost', 'joe'], bottom: [] })
    renderTable(() => pinning.bind())
    expect(dataRowNames()).toEqual(['joe', 'tanner', 'tandy'])
    expect(pinning.onUpdate).not.toHaveBeenCalled()
  })
})

describe('GsTable variant', () => {
  const variants: GsTableVariant[] = ['cozy', 'compact', 'crammed']

  function headerCellBoxes() {
    return screen.getAllByRole('columnheader').map((th) => th.firstElementChild)
  }

  it.each(variants)('applies %s to header cells and cells, including meta cells', (variant) => {
    renderTable({ variant, showCheckbox: true })
    for (const box of headerCellBoxes()) {
      expect(box).toHaveClass('headerCell', variant)
      for (const other of variants.filter((v) => v !== variant)) expect(box).not.toHaveClass(other)
    }
    for (const cell of screen.getAllByRole('cell')) expect(cell).toHaveClass('cell', variant)
    for (const row of screen.getAllByRole('row')) expect(row).not.toHaveClass(variant)
  })

  it('defaults to cozy, or the provided variant', () => {
    const first = renderTable()
    expect(screen.getAllByRole('cell')[0]).toHaveClass('cozy')
    first.unmount()

    const Host = defineComponent(() => {
      provideTableDefaults({ variant: 'compact' })
      return () => h(GsTable as Component, { columns: personColumns, data: people })
    })
    render(Host)
    expect(screen.getAllByRole('cell')[0]).toHaveClass('compact')
  })

  it.each([
    ['cozy', 'cozy'],
    ['compact', 'compact'],
    ['crammed', 'compact'],
  ] as const)('opens %s menus at %s density', async (variant, menuVariant) => {
    renderTable({ variant })
    await userEvent.click(screen.getByRole('button', { name: 'Row 1 actions' }))
    expect(await screen.findByRole('menu')).toHaveClass(menuVariant)
    await userEvent.keyboard('{Escape}')
    await waitFor(() => expect(screen.queryByRole('menu')).not.toBeInTheDocument())

    expect(await openColumnMenu('Age')).toHaveClass(menuVariant)
  })
})

describe('GsTable meta columns', () => {
  function numeralCell() {
    return within(screen.getAllByRole('row')[1]!).getByText('1').closest('td')
  }

  it('shows row numbers while hovered unless persist-numerals is set', () => {
    const first = renderTable()
    expect(numeralCell()).toHaveClass('hideInRow')
    first.unmount()

    renderTable({ persistNumerals: true })
    expect(numeralCell()).not.toHaveClass('hideInRow')
  })

  it('hides the numeral header and cells without display-numerals, whatever persist-numerals says', () => {
    renderTable({ displayNumerals: false, persistNumerals: true })
    expect(screen.getAllByRole('columnheader')[0]).toHaveClass('hidden')
    expect(numeralCell()).toHaveClass('hidden')
  })

  it('shows the menus while hovered without persist-*-kebab-menu', () => {
    renderTable({ persistHeaderKebabMenu: false, persistRowKebabMenu: false })
    expect(screen.getByRole('button', { name: 'Age column actions' }).parentElement).toHaveClass(
      'hideInHeader',
    )
    expect(screen.getByRole('button', { name: 'Row 1 actions' }).parentElement).toHaveClass(
      'hideInRow',
    )
  })

  it('leaves out the row actions without enable-row-actions, and puts them left with kebab-position', () => {
    const first = renderTable({ enableRowActions: false })
    expect(screen.queryByRole('button', { name: /Row \d actions/ })).not.toBeInTheDocument()
    first.unmount()

    renderTable({ kebabPosition: 'left' })
    const cells = within(screen.getAllByRole('row')[1]!).getAllByRole('cell')
    expect(within(cells[1]!).getByRole('button', { name: 'Row 1 actions' })).toBeInTheDocument()
  })
})

describe('GsTable column order', () => {
  type Author = { id: string; name: string; series: string[]; books: number }
  const authorHelper = createTableColumnHelper<Author>()
  const authorColumns = [
    authorHelper.accessor('name', { id: 'name', header: 'Name' }),
    authorHelper.accessor('series', {
      id: 'series',
      header: 'Series',
      cell: (info) => info.getValue().join(', '),
    }),
    authorHelper.accessor('books', { id: 'books', header: 'Books' }),
  ]
  const authors: Author[] = [
    { id: '1', name: 'George R.R. Martin', series: ['ASOIAF'], books: 5 },
    { id: '2', name: 'Brandon Sanderson', series: ['Mistborn', 'Stormlight Archive'], books: 10 },
  ]
  const renderAuthors = (props: Props | (() => Props) = {}) =>
    renderTable(() => ({
      columns: authorColumns,
      data: authors,
      ...(typeof props === 'function' ? props() : props),
    }))

  it('renders your columns in the bound order and keeps the meta columns in place', () => {
    renderAuthors({ columnOrder: ['series', 'name', 'books'] })
    expect(headerTexts()).toEqual(['Row', 'Series', 'Name', 'Books', 'Actions'])
  })

  it('keeps the selection and left kebab columns ahead of the order', () => {
    renderAuthors({
      showCheckbox: true,
      kebabPosition: 'left',
      columnOrder: ['series', 'name', 'books'],
    })
    expect(headerTexts()).toEqual(['Row', '', 'Actions', 'Series', 'Name', 'Books'])
  })

  it('appends columns missing from a partial order and ignores meta ids', () => {
    const first = renderAuthors({ columnOrder: ['books'] })
    expect(headerTexts()).toEqual(['Row', 'Books', 'Name', 'Series', 'Actions'])
    first.unmount()

    renderAuthors({ columnOrder: ['kebab', 'series', 'name', 'books'] })
    expect(headerTexts()).toEqual(['Row', 'Series', 'Name', 'Books', 'Actions'])
  })

  it('moves header and body columns without a binding', async () => {
    renderAuthors()
    await chooseColumnAction('Name', 'Move Column Right')
    expect(headerTexts()).toEqual(['Row', 'Series', 'Name', 'Books', 'Actions'])
    const cells = within(screen.getAllByRole('row')[1]!).getAllByRole('cell')
    expect(cells.map((cell) => cell.textContent)).toEqual([
      '1',
      'ASOIAF',
      'George R.R. Martin',
      '5',
      '',
    ])
  })

  it('starts from default-column-order', async () => {
    renderAuthors({ defaultColumnOrder: ['books'] })
    expect(headerTexts()).toEqual(['Row', 'Books', 'Name', 'Series', 'Actions'])
    await chooseColumnAction('Books', 'Move Column Right')
    expect(headerTexts()).toEqual(['Row', 'Name', 'Books', 'Series', 'Actions'])
  })

  it('follows columns changes without remounting', async () => {
    const columns = ref(authorColumns.slice(0, 2))
    renderAuthors(() => ({ columns: columns.value, columnOrder: ['series', 'name'] }))
    expect(headerTexts()).toEqual(['Row', 'Series', 'Name', 'Actions'])

    columns.value = authorColumns
    await waitFor(() =>
      expect(headerTexts()).toEqual(['Row', 'Series', 'Name', 'Books', 'Actions']),
    )
  })

  it.each([
    ['Name', 'Move Column Right', ['series', 'name', 'books']],
    ['Books', 'Move Column Left', ['name', 'books', 'series']],
  ])('emits every column id when %s does %s', async (column, item, expected) => {
    const order = model<ColumnOrderState>('columnOrder', ['name', 'series', 'books'])
    renderAuthors(() => order.bind())
    await chooseColumnAction(column, item)
    expect(order.onUpdate).toHaveBeenCalledExactlyOnceWith(expected)
  })

  it('emits every column id when the bound order was partial', async () => {
    const order = model<ColumnOrderState>('columnOrder', ['books'])
    renderAuthors(() => order.bind())
    await chooseColumnAction('Books', 'Move Column Right')
    expect(order.onUpdate).toHaveBeenCalledWith(['name', 'books', 'series'])
  })

  it.each([
    ['Name', 'Move Column Left'],
    ['Books', 'Move Column Right'],
  ])('disables moving %s past the edge (%s)', async (column, item) => {
    const order = model<ColumnOrderState>('columnOrder', ['name', 'series', 'books'])
    renderAuthors(() => order.bind())
    const menu = await openColumnMenu(column)
    expect(within(menu).getByRole('menuitem', { name: item })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(order.onUpdate).not.toHaveBeenCalled()
  })
})

describe('GsTable column sizing', () => {
  const width = (th: HTMLElement) => th.style.getPropertyValue('--table-column-width')

  it('sizes header and body cells from the column size, and meta columns at 32px', () => {
    const columns = [helper.accessor('name', { id: 'name', header: 'Name', size: 64 })]
    renderTable({ columns })
    const [numeral, name] = screen.getAllByRole('columnheader')
    expect(width(numeral!)).toBe('32px')
    expect(width(name!)).toBe('64px')
    expect(width(screen.getByRole('cell', { name: 'tanner' }))).toBe('64px')
  })

  it('takes widths from v-model:column-sizing', async () => {
    const sizing = model<ColumnSizingState>('columnSizing', { age: 80 })
    renderTable(() => sizing.bind())
    expect(width(columnHeader('Age'))).toBe('80px')

    sizing.value.value = { age: 90 }
    await waitFor(() => expect(width(columnHeader('Age'))).toBe('90px'))
  })

  it('uses a fixed full-width layout with full-width', () => {
    renderTable({ fullWidth: true })
    expect(screen.getByRole('table')).toHaveClass('table', 'fullWidth')
  })
})

describe('GsTable pagination', () => {
  const many: Person[] = Array.from({ length: 25 }, (_, i) => ({
    id: `person-${i + 1}`,
    name: `first-${i + 1}`,
    age: i,
  }))

  function renderPaginated(onUpdate?: (page: number) => void) {
    const page = ref(1)
    const setPage = (next: number) => {
      onUpdate?.(next)
      page.value = next
    }
    render(() => [
      h(GsTable as Component, {
        columns: personColumns,
        data: many,
        pageSize: 10,
        page: page.value,
        'onUpdate:page': setPage,
      }),
      h(GsPagination, { total: 3, modelValue: page.value, 'onUpdate:modelValue': setPage }),
    ])
  }

  it('shows one page of rows', () => {
    renderPaginated()
    expect(screen.getAllByRole('row')).toHaveLength(11)
    expect(screen.getByText('first-1')).toBeInTheDocument()
    expect(screen.getByText('first-10')).toBeInTheDocument()
    expect(screen.queryByText('first-11')).not.toBeInTheDocument()
  })

  it('follows a GsPagination bound to the same page', async () => {
    renderPaginated()
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(screen.getByText('first-11')).toBeInTheDocument()
    expect(screen.queryByText('first-1')).not.toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Page 3' }))
    expect(screen.getAllByRole('row')).toHaveLength(6)
    expect(screen.getByText('first-25')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Previous page' }))
    expect(screen.getByText('first-20')).toBeInTheDocument()
  })

  it('starts from default-page without a binding', () => {
    renderTable({ data: many, pageSize: 10, defaultPage: 2 })
    expect(screen.getByText('first-11')).toBeInTheDocument()
    expect(screen.queryByText('first-1')).not.toBeInTheDocument()
  })

  it('renders every row without page-size', () => {
    renderTable({ data: many })
    expect(screen.getAllByRole('row')).toHaveLength(26)
  })

  it('reports page changes as plain numbers', async () => {
    const onUpdate = vi.fn()
    renderPaginated(onUpdate)
    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(onUpdate).toHaveBeenCalledExactlyOnceWith(2)
  })
})

describe('GsTable slots and classes', () => {
  it('renders #header-<id> and #cell-<id> slots in place of the column renderers', () => {
    const cell = vi.fn(({ value, row }: GsTableCellSlotProps<Person>) =>
      h('b', `${String(value)} (${row.original.id})`),
    )
    renderTable(
      {},
      {
        'header-age': () => 'Years',
        'cell-age': cell,
      },
    )
    expect(columnHeader('Years')).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Years column actions' })).toBeInTheDocument()
    expect(screen.getByText('24 (tanner)').tagName).toBe('B')
    expect(screen.getByText('Name')).toBeInTheDocument()
    expect(screen.getByText('tanner')).toBeInTheDocument()
  })

  it('puts classes.content on the header cell box', () => {
    render(() =>
      h('table', null, [
        h(GsTableHeader, null, () =>
          h(
            'tr',
            null,
            h(GsTableHeaderCell, { classes: { content: 'custom' } }, () => 'Callsign'),
          ),
        ),
      ]),
    )
    expect(screen.getByText('Callsign').closest('div')).toHaveClass('headerCell', 'custom')
  })
})
