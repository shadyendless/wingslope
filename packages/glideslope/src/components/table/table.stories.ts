import type { Meta, StoryObj } from '@storybook/vue3-vite'
import type {
  ColumnOrderState,
  RowPinningState,
  RowSelectionState,
  SortingState,
} from '@tanstack/vue-table'
import { computed, h, onBeforeUnmount, onMounted, ref, type ConcreteComponent } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsPagination from '../pagination/GsPagination.vue'
import { createTableColumnHelper } from './features'
import GsTable from './GsTable.vue'
import GsTableBody from './GsTableBody.vue'
import GsTableCell from './GsTableCell.vue'
import GsTableHeader from './GsTableHeader.vue'
import GsTableHeaderCell from './GsTableHeaderCell.vue'
import GsTableRow from './GsTableRow.vue'

interface Person {
  id: string
  firstName: string
  lastName: string
  age: number
  visits: number
  status: string
  progress: number
}

const defaultData: Person[] = [
  {
    id: 'tanner',
    firstName: 'tanner',
    lastName: 'linsley',
    age: 24,
    visits: 100,
    status: 'In Relationship',
    progress: 50,
  },
  {
    id: 'tandy',
    firstName: 'tandy',
    lastName: 'miller',
    age: 40,
    visits: 40,
    status: 'Single',
    progress: 80,
  },
  {
    id: 'joe',
    firstName: 'joe',
    lastName: 'dirte',
    age: 45,
    visits: 20,
    status: 'Complicated',
    progress: 10,
  },
  {
    id: 'jane',
    firstName: 'jane',
    lastName: 'doe',
    age: 30,
    visits: 60,
    status: 'Married',
    progress: 70,
  },
  {
    id: 'john',
    firstName: 'john',
    lastName: 'smith',
    age: 35,
    visits: 80,
    status: 'Single',
    progress: 90,
  },
  {
    id: 'alice',
    firstName: 'alice',
    lastName: 'johnson',
    age: 28,
    visits: 50,
    status: 'In Relationship',
    progress: 40,
  },
  {
    id: 'bob',
    firstName: 'bob',
    lastName: 'brown',
    age: 32,
    visits: 70,
    status: 'Complicated',
    progress: 20,
  },
  {
    id: 'charlie',
    firstName: 'charlie',
    lastName: 'white',
    age: 29,
    visits: 90,
    status: 'Single',
    progress: 30,
  },
  {
    id: 'dave',
    firstName: 'dave',
    lastName: 'green',
    age: 38,
    visits: 110,
    status: 'In Relationship',
    progress: 60,
  },
]

const firstNames = [
  'Alice',
  'Bob',
  'Charlie',
  'Dave',
  'Eve',
  'Frank',
  'Grace',
  'Hank',
  'Ivy',
  'Jack',
]
const lastNames = [
  'Smith',
  'Johnson',
  'Brown',
  'White',
  'Green',
  'Miller',
  'Davis',
  'Wilson',
  'Moore',
  'Taylor',
]
const statuses = ['Single', 'In Relationship', 'Complicated', 'Married']

function generateData(count: number): Person[] {
  return Array.from({ length: count }, (_, i) => {
    const n = i + 1
    return {
      id: `person-${n}`,
      firstName: `${firstNames[i % firstNames.length]}-${n}`,
      lastName: `${lastNames[i % lastNames.length]}-${n}`,
      age: 20 + (i % 40),
      visits: (i * 7) % 100,
      status: statuses[i % statuses.length] as string,
      progress: (i * 13) % 100,
    }
  })
}

const allData = generateData(100)
const PAGE_SIZE = 10
const totalPages = Math.ceil(allData.length / PAGE_SIZE)

const columnHelper = createTableColumnHelper<Person>()

const columns = [
  columnHelper.accessor('firstName', {
    id: 'firstName',
    cell: (info) => info.getValue(),
    header: () => h('span', 'First Name'),
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: 'lastName',
    cell: (info) => h('i', info.getValue()),
    header: () => h('span', 'Last Name'),
  }),
  columnHelper.accessor('age', {
    id: 'age',
    cell: (info) => info.renderValue(),
    header: () => 'Age',
    size: 42,
  }),
  columnHelper.accessor('visits', {
    id: 'visits',
    header: () => h('span', 'Visits'),
    size: 42,
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: 'Status',
  }),
  columnHelper.accessor('progress', {
    id: 'progress',
    header: 'Profile Progress',
  }),
]

const meta = {
  title: 'Components/Table',
  // Storybook's `component` type can't hold a generic component (vue-tsc types it as a generic
  // function), so it gets a plain component type. Args are still typed from GsTable below.
  component: GsTable as unknown as Omit<ConcreteComponent, 'props'>,
  args: {
    columns,
    data: defaultData,
    showCheckbox: true,
    kebabPosition: 'right',
    persistHeaderKebabMenu: true,
    persistRowKebabMenu: true,
    persistNumerals: true,
    displayNumerals: false,
    enableSorting: true,
    enableColumnReordering: true,
    enableRowActions: true,
    fullWidth: false,
    variant: 'cozy',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['cozy', 'compact', 'crammed'],
    },
    kebabPosition: {
      control: 'radio',
      options: ['left', 'right'],
    },
  },
  parameters: {
    controls: {
      exclude: ['columns', 'data'],
    },
    docs: {
      subtitle: 'Configurable data table with sorting, selection, and row actions',
    },
  },
} satisfies Meta<typeof GsTable<Person>>

export default meta
type Story = StoryObj<typeof meta>

const table = {
  render: (args: Story['args']) => ({
    components: { GsTable },
    setup: () => ({ args }),
    template: '<GsTable v-bind="args" />',
  }),
}

export const Default: Story = {
  args: {
    kebabPosition: 'right',
    enableSorting: false,
  },
  ...table,
}

export const SortableColumns: Story = {
  args: {
    kebabPosition: 'left',
  },
  parameters: {
    docs: {
      description: {
        story:
          'Use the column header menu (kebab) to sort ascending, descending, or clear sorting; uncontrolled by default.',
      },
    },
  },
  ...table,
}

export const CompactDensity: Story = {
  args: {
    variant: 'compact',
    showCheckbox: true,
    persistNumerals: true,
    kebabPosition: 'right',
    persistRowKebabMenu: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The `compact` variant steps header cell and cell padding down one token on the spacing scale, from 12px (`p-m`) to 8px (`p-s`). Numeral, selection, and kebab cells follow the same step, and the kebab menus open at menu `compact` density.',
      },
    },
  },
  ...table,
}

export const CrammedDensity: Story = {
  args: {
    variant: 'crammed',
    showCheckbox: true,
    persistNumerals: true,
    kebabPosition: 'right',
    persistRowKebabMenu: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The `crammed` variant is the densest step: header cell and cell padding drop to 2px (`p-xxs`) and cells render single-line (`whitespace-nowrap`) so the 2px padding stays usable. Meta columns stay 32px wide and the checkbox and kebab button keep their normal size; the kebab menus open at menu `compact` density because `GsMenu` has no `crammed` step.',
      },
    },
  },
  ...table,
}

const sortState = `
  <div class="mt-l">
    <strong>Sort state:</strong>
    <p>{{ JSON.stringify(sort) }}</p>
  </div>`

export const ControlledSorting: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`v-model:sort` binds the sort: an `update:sort` event always carries the plain next `SortingState` (`[{ id, desc }]` or `[]`). The current sort state is rendered below the table as JSON.',
      },
    },
  },
  render: (args) => ({
    components: { GsTable },
    setup: () => ({ args, sort: ref<SortingState>([]) }),
    template: `
      <div>
        <GsTable v-bind="args" v-model:sort="sort" />
        ${sortState}
      </div>`,
  }),
}

export const ServerSideSorting: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Server-side sorting with `manual-sorting`: the table never reorders rows itself and renders `data` as given. The story binds `v-model:sort` and re-sorts the data in a `computed` from `sort[0]` (standing in for a server query). The header still shows the sort arrow and `aria-sort` because the sort state feeds the table in both modes.',
      },
    },
  },
  render: (args) => ({
    components: { GsTable },
    setup: () => {
      const sort = ref<SortingState>([])
      const sortedData = computed(() => {
        const entry = sort.value[0]
        if (!entry) return defaultData

        const key = entry.id as keyof Person
        const direction = entry.desc ? -1 : 1
        return [...defaultData].sort((a, b) => {
          if (a[key] < b[key]) return -direction
          if (a[key] > b[key]) return direction
          return 0
        })
      })
      return { args, sort, sortedData }
    },
    template: `
      <div>
        <GsTable v-bind="args" v-model:sort="sort" :data="sortedData" manual-sorting />
        ${sortState}
      </div>`,
  }),
}

const columnsWithSizing = [
  columnHelper.accessor('firstName', {
    id: 'firstName',
    cell: (info) => info.getValue(),
    header: () => h('span', 'First Name'),
  }),
  columnHelper.accessor((row) => row.lastName, {
    id: 'lastName',
    cell: (info) => h('i', info.getValue()),
    header: () => h('span', 'Last Name'),
  }),
  columnHelper.accessor('age', {
    id: 'age',
    cell: (info) => info.renderValue(),
    header: () => 'Age',
    size: 42,
  }),
  columnHelper.accessor('visits', {
    id: 'visits',
    header: () => h('span', 'Visits'),
    size: 42,
  }),
  columnHelper.accessor('status', {
    id: 'status',
    header: 'Status',
  }),
  columnHelper.accessor('progress', {
    id: 'progress',
    header: 'Profile Progress',
    size: 64,
  }),
]

export const ColumnSizing: Story = {
  args: {
    fullWidth: true,
  },
  parameters: {
    docs: {
      description: {
        story:
          'Columns can have custom sizes defined using the `size` property in the column definition. The table automatically applies these widths.',
      },
    },
    layout: 'fullscreen',
  },
  render: (args) => ({
    components: { GsTable },
    setup: () => ({ args, columnsWithSizing, defaultData }),
    template: '<GsTable v-bind="args" :columns="columnsWithSizing" :data="defaultData" />',
  }),
}

export const InitialRowSelection: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Use the `default-row-selection` prop to specify which rows start selected, and the `update:row-selection` event to track selection changes. The event always carries the plain next `RowSelectionState`. In this example, tanner and joe start selected, and the last event payload is rendered below the table as JSON.',
      },
    },
  },
  render: (args) => ({
    components: { GsTable },
    setup: () => ({ args, lastPayload: ref<RowSelectionState | null>(null) }),
    template: `
      <div>
        <GsTable
          v-bind="args"
          :default-row-selection="{ tanner: true, joe: true }"
          @update:row-selection="lastPayload = $event"
        />
        <div class="mt-l">
          <strong>Last update:row-selection payload:</strong>
          <p>{{ lastPayload ? JSON.stringify(lastPayload) : 'No changes yet' }}</p>
        </div>
      </div>`,
  }),
}

export const ControlledRowSelection: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`v-model:row-selection` binds the selection, and the table reflects every change to it after mount. The "Clear selection" button drives the checkboxes from outside the table without a remount.',
      },
    },
  },
  render: (args) => ({
    components: { GsTable, GsButton },
    setup: () => {
      const selection = ref<RowSelectionState>({ tanner: true, joe: true })
      const selectedIds = computed(() => Object.keys(selection.value))
      return { args, selection, selectedIds }
    },
    template: `
      <div>
        <GsTable v-bind="args" v-model:row-selection="selection" />
        <div class="mt-l">
          <GsButton @click="selection = {}">Clear selection</GsButton>
          <p>
            <strong>Selected Row IDs:</strong>
            {{ selectedIds.length > 0 ? selectedIds.join(', ') : 'No rows selected' }}
          </p>
        </div>
      </div>`,
  }),
}

export const ControlledRowPinning: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`v-model:row-pinning` binds the pinning: an `update:row-pinning` event always carries the plain next `RowPinningState` (`{ top, bottom }`). Pin or unpin rows via the row kebab menu; the "Unpin all" button clears the pinning from outside the table without a remount. The current pinning state is rendered below the table as JSON.',
      },
    },
  },
  render: (args) => ({
    components: { GsTable, GsButton },
    setup: () => ({ args, pinning: ref<RowPinningState>({ top: ['joe'], bottom: [] }) }),
    template: `
      <div>
        <GsTable v-bind="args" v-model:row-pinning="pinning" />
        <div class="mt-l">
          <GsButton @click="pinning = { top: [], bottom: [] }">Unpin all</GsButton>
          <p><strong>Pinning state:</strong> {{ JSON.stringify(pinning) }}</p>
        </div>
      </div>`,
  }),
}

export const ControlledColumnOrder: Story = {
  parameters: {
    docs: {
      description: {
        story:
          '`v-model:column-order` binds the column order: an `update:column-order` event always carries the plain next `ColumnOrderState` (`string[]`). The story starts with `age` first and the name columns swapped, so the bound value visibly differs from the `columns` definition order. Reorder columns via the header kebab menu (Move Column Left / Right), or use the "Reset order" button to restore that starting order from outside the table without a remount. The current order is rendered below the table as JSON.',
      },
    },
  },
  render: (args) => ({
    components: { GsTable, GsButton },
    setup: () => {
      const startingOrder: ColumnOrderState = [
        'age',
        'lastName',
        'firstName',
        'visits',
        'status',
        'progress',
      ]
      return { args, startingOrder, order: ref<ColumnOrderState>(startingOrder) }
    },
    template: `
      <div>
        <GsTable v-bind="args" v-model:column-order="order" />
        <div class="mt-l">
          <GsButton @click="order = startingOrder">Reset order</GsButton>
          <p><strong>Column order:</strong> {{ JSON.stringify(order) }}</p>
        </div>
      </div>`,
  }),
}

export const ClientSidePagination: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Client-side pagination. Pass all data and a `page-size` prop: the table slices the data itself through TanStack's paginated row model. Render a `GsPagination` bound to the same page to navigate.",
      },
    },
  },
  render: (args) => ({
    components: { GsTable, GsPagination },
    setup: () => ({ args, allData, PAGE_SIZE, totalPages, page: ref(1) }),
    template: `
      <div>
        <GsTable v-bind="args" v-model:page="page" :data="allData" :page-size="PAGE_SIZE" />
        <GsPagination v-model="page" :total="totalPages" />
      </div>`,
  }),
}

export const PrePaginated: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Simulates server-side pagination where only the current page of data is passed to the table. The table reflects `data` changes directly, so no remount is needed when the page changes.',
      },
    },
  },
  render: (args) => ({
    components: { GsTable, GsPagination },
    setup: () => {
      const page = ref(1)
      const pageData = computed(() =>
        allData.slice((page.value - 1) * PAGE_SIZE, page.value * PAGE_SIZE),
      )
      return { args, page, pageData, totalPages }
    },
    template: `
      <div>
        <GsTable v-bind="args" :data="pageData" />
        <GsPagination v-model="page" :total="totalPages" />
      </div>`,
  }),
}

export const LiveUpdates: Story = {
  parameters: {
    docs: {
      description: {
        story:
          "Simulates polling an endpoint: every second the `data` prop is replaced and the Visits/Profile Progress cells of a single row change, cycling through the rows; every few seconds a row is added or removed. The table reflects each update directly, without a remount. Manual row reordering (kebab menu → Move Up/Down) is preserved; rows that appear after a manual reorder are appended at the end. The wrapper reserves height for the maximum row count so add/remove doesn't shift the layout; in real apps, a fixed-height scroll container or `page-size` does the same job.",
      },
    },
  },
  render: (args) => ({
    components: { GsTable },
    setup: () => {
      const tick = ref(0)
      let timer: ReturnType<typeof setInterval> | undefined
      onMounted(() => (timer = setInterval(() => tick.value++, 1000)))
      onBeforeUnmount(() => clearInterval(timer))

      const data = computed(() => {
        // 5..9 rows, one added or removed every 7 ticks.
        const count = 5 + (Math.floor(tick.value / 7) % 5)
        return defaultData.slice(0, count).map((person, index) => {
          // Staggered, so exactly one row's cells change per tick.
          const steps = Math.floor((tick.value + index) / count)
          return {
            ...person,
            visits: person.visits + steps,
            progress: (person.progress + steps * 7) % 100,
          }
        })
      })
      return { args, data }
    },
    // Reserve height for the most rows, so adding and removing them doesn't shift the layout.
    template: `
      <div class="min-h-[500px]">
        <GsTable v-bind="args" :data="data" />
      </div>`,
  }),
}

export const Static: Story = {
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Manual table composition using the parts (`GsTableHeader`, `GsTableBody`, `GsTableRow`, `GsTableHeaderCell`, `GsTableCell`) for full control over rendering. Without `columns`, the table has no menus, selection or meta columns; its `variant` prop still sets the density, and `provideTableDefaults` sets it for parts composed into a plain `<table>`.',
      },
    },
  },
  render: () => ({
    components: {
      GsTable,
      GsTableHeader,
      GsTableBody,
      GsTableRow,
      GsTableHeaderCell,
      GsTableCell,
    },
    setup: () => ({ defaultData }),
    template: `
      <GsTable>
        <GsTableHeader>
          <GsTableRow>
            <GsTableHeaderCell>First Name</GsTableHeaderCell>
            <GsTableHeaderCell>Last Name</GsTableHeaderCell>
            <GsTableHeaderCell>Age</GsTableHeaderCell>
            <GsTableHeaderCell>Visits</GsTableHeaderCell>
            <GsTableHeaderCell>Status</GsTableHeaderCell>
            <GsTableHeaderCell>Progress</GsTableHeaderCell>
          </GsTableRow>
        </GsTableHeader>
        <GsTableBody>
          <GsTableRow v-for="person in defaultData" :key="person.id">
            <GsTableCell>{{ person.firstName }}</GsTableCell>
            <GsTableCell>{{ person.lastName }}</GsTableCell>
            <GsTableCell>{{ person.age }}</GsTableCell>
            <GsTableCell>{{ person.visits }}</GsTableCell>
            <GsTableCell>{{ person.status }}</GsTableCell>
            <GsTableCell>{{ person.progress }}%</GsTableCell>
          </GsTableRow>
        </GsTableBody>
      </GsTable>`,
  }),
}

/**
 * Glideslope only: the `#header-<columnId>` and `#cell-<columnId>` slots render a column's header
 * and cells in the template, in place of the column definition's `h()` renderers.
 */
export const CellSlots: Story = {
  render: (args) => ({
    components: { GsTable },
    setup: () => ({ args }),
    template: `
      <GsTable v-bind="args">
        <template #header-progress>Progress (%)</template>
        <template #cell-progress="{ value }">
          <strong :class="value < 50 ? 'fg-serious-bold' : 'fg-normal-bold'">{{ value }}%</strong>
        </template>
      </GsTable>`,
  }),
}
