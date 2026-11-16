import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { AddIcon, KebabIcon } from '@wingbrace/glideslope-icons'
import { computed, ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsMenu from '../menu/GsMenu.vue'
import GsMenuItem from '../menu/GsMenuItem.vue'
import GsKanban from './GsKanban.vue'
import GsKanbanCard from './GsKanbanCard.vue'
import GsKanbanCardBody from './GsKanbanCardBody.vue'
import GsKanbanCardHeader from './GsKanbanCardHeader.vue'
import GsKanbanCardHeaderActions from './GsKanbanCardHeaderActions.vue'
import GsKanbanCardHeaderTitle from './GsKanbanCardHeaderTitle.vue'
import GsKanbanCardMoveMenu from './GsKanbanCardMoveMenu.vue'
import GsKanbanColumn from './GsKanbanColumn.vue'
import GsKanbanColumnActions from './GsKanbanColumnActions.vue'
import GsKanbanColumnContainer from './GsKanbanColumnContainer.vue'
import GsKanbanColumnContent from './GsKanbanColumnContent.vue'
import GsKanbanColumnHeader from './GsKanbanColumnHeader.vue'
import GsKanbanColumnHeaderActions from './GsKanbanColumnHeaderActions.vue'
import GsKanbanColumnHeaderTitle from './GsKanbanColumnHeaderTitle.vue'
import GsKanbanHeader from './GsKanbanHeader.vue'
import GsKanbanHeaderActions from './GsKanbanHeaderActions.vue'
import GsKanbanHeaderSearch from './GsKanbanHeaderSearch.vue'
import GsKanbanHeaderTitle from './GsKanbanHeaderTitle.vue'
import type { GsKanbanCardData, GsKanbanColumnData } from './types'

/** The Design Toolkit's sample board. */
const columnData: GsKanbanColumnData[] = [
  {
    title: 'To Do',
    id: 'todo',
    cards: [
      {
        title: 'Drag and Drop Columns',
        body: 'Reorganize the columns for drag and drop.',
        id: 'id-1',
        columnId: 'todo',
        position: 0,
      },
      {
        title: 'Drag and Drop Cards',
        body: 'Arrange cards for drag and drop.',
        id: 'id-2',
        columnId: 'todo',
        position: 1,
      },
      {
        title: 'Cross post cards to other columns',
        body: 'Extend the functionality of card drag and drop to allow for dragging to other columns.',
        id: 'id-3',
        columnId: 'todo',
        position: 2,
      },
    ],
  },
  {
    title: 'In Progress',
    id: 'inProgress',
    cards: [
      {
        title: 'Base Implementation of Drag and Drop',
        body: 'Initial setup for @atlaskit/pragmatic-drag-and-drop',
        id: 'id-4',
        columnId: 'inProgress',
        position: 0,
      },
      {
        title: 'Refactor styling.',
        body: 'Update kanban board component styling to reflect proposed new standards.',
        id: 'id-5',
        columnId: 'inProgress',
        position: 1,
      },
    ],
  },
  { title: 'In Review', cards: [], id: 'inReview' },
  {
    title: 'Done',
    id: 'done',
    cards: [
      {
        title: 'Kanban Board',
        body: 'Base component for the kanban board.',
        id: 'id-6',
        columnId: 'done',
        position: 0,
      },
      {
        title: 'Kanban Card',
        body: 'Base components for kanban cards.',
        id: 'id-7',
        columnId: 'done',
        position: 1,
      },
    ],
  },
]

/** A fresh copy of the board, for a story's own state (Storybook's args can't be cloned). */
const copy = (columns: GsKanbanColumnData[]) =>
  columns.map((column) => ({ ...column, cards: column.cards.map((card) => ({ ...card })) }))

const components = {
  GsKanban,
  GsKanbanHeader,
  GsKanbanHeaderTitle,
  GsKanbanHeaderActions,
  GsKanbanHeaderSearch,
  GsKanbanColumnContainer,
  GsKanbanColumn,
  GsKanbanColumnHeader,
  GsKanbanColumnHeaderTitle,
  GsKanbanColumnHeaderActions,
  GsKanbanColumnContent,
  GsKanbanColumnActions,
  GsKanbanCard,
  GsKanbanCardHeader,
  GsKanbanCardHeaderTitle,
  GsKanbanCardHeaderActions,
  GsKanbanCardBody,
  GsKanbanCardMoveMenu,
  GsButton,
  GsIcon,
  GsMenu,
  GsMenuItem,
  AddIcon,
  KebabIcon,
}

/**
 * One `GsKanbanColumn` per column of `list`, with its header and cards: `cards` is each card's
 * content, `after` what follows the column's content.
 */
const column = ({ list = 'columns', cards = '', after = '' }) => `
  <GsKanbanColumn v-for="column in ${list}" :key="column.id" :column="column">
    <GsKanbanColumnHeader>
      <GsKanbanColumnHeaderTitle>{{ column.title }}</GsKanbanColumnHeaderTitle>
      <GsKanbanColumnHeaderActions :card-count="column.cards.length" />
    </GsKanbanColumnHeader>
    <GsKanbanColumnContent :column="column">
      <GsKanbanCard v-for="card in column.cards" :key="card.id" :card="card">${cards}</GsKanbanCard>
    </GsKanbanColumnContent>${after}
  </GsKanbanColumn>`

const meta = {
  title: 'Components/Kanban',
  component: GsKanban,
  // The board's initial data; each story keeps its own copy and binds it with v-model:columns.
  args: { columns: columnData },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GsKanban>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components,
    setup: () => ({ columns: ref(copy(args.columns)) }),
    template: `
      <div class="h-screen">
        <GsKanban v-model:columns="columns">
          <GsKanbanHeader>
            <GsKanbanHeaderTitle>Project Board</GsKanbanHeaderTitle>
          </GsKanbanHeader>
          <GsKanbanColumnContainer>${column({
            cards: `
            <GsKanbanCardHeader>
              <GsKanbanCardHeaderTitle>{{ card.title }}</GsKanbanCardHeaderTitle>
            </GsKanbanCardHeader>
            <GsKanbanCardBody>{{ card.body }}</GsKanbanCardBody>`,
          })}
          </GsKanbanColumnContainer>
        </GsKanban>
      </div>`,
  }),
}

export const CompleteExample: Story = {
  render: (args) => ({
    components,
    setup: () => {
      const columns = ref(copy(args.columns))
      const searchTerm = ref('')

      const filteredColumns = computed(() =>
        columns.value.map((column) => ({
          ...column,
          cards: column.cards.filter(
            (card) =>
              card.title.toLowerCase().includes(searchTerm.value.toLowerCase()) ||
              card.body.toLowerCase().includes(searchTerm.value.toLowerCase()),
          ),
        })),
      )

      const handleAddCard = (columnId: string) => {
        const newCard: GsKanbanCardData = {
          id: crypto.randomUUID(),
          title: `New Task ${Date.now()}`,
          body: 'Card description',
          columnId,
          position: columns.value.find((c) => c.id === columnId)?.cards.length ?? 0,
        }
        columns.value = columns.value.map((col) =>
          col.id === columnId ? { ...col, cards: [...col.cards, newCard] } : col,
        )
      }

      const handleDeleteCard = (cardId: string) => {
        columns.value = columns.value.map((col) => ({
          ...col,
          cards: col.cards.filter((card) => card.id !== cardId),
        }))
      }

      const handleAddColumn = () => {
        const newColumn: GsKanbanColumnData = {
          id: crypto.randomUUID(),
          title: `New Column ${columns.value.length + 1}`,
          cards: [],
        }
        columns.value = [...columns.value, newColumn]
      }

      const handleEditCard = (cardId: string) => {
        const newTitle = prompt('Enter new title:')
        if (newTitle) {
          columns.value = columns.value.map((col) => ({
            ...col,
            cards: col.cards.map((card) =>
              card.id === cardId ? { ...card, title: newTitle } : card,
            ),
          }))
        }
      }

      return {
        columns,
        searchTerm,
        filteredColumns,
        handleAddCard,
        handleDeleteCard,
        handleAddColumn,
        handleEditCard,
      }
    },
    template: `
      <div class="h-screen">
        <GsKanban v-model:columns="columns">
          <GsKanbanHeader>
            <GsKanbanHeaderTitle>Complete Kanban Board</GsKanbanHeaderTitle>
            <GsKanbanHeaderActions class="space-x-s">
              <GsKanbanHeaderSearch v-model="searchTerm" placeholder="Search" />
              <GsButton @click="handleAddColumn">
                <GsIcon><AddIcon /></GsIcon>
                Add Column
              </GsButton>
            </GsKanbanHeaderActions>
          </GsKanbanHeader>
          <GsKanbanColumnContainer>${column({
            list: 'filteredColumns',
            cards: `
            <GsKanbanCardHeader>
              <GsKanbanCardHeaderTitle>{{ card.title }}</GsKanbanCardHeaderTitle>
              <GsKanbanCardHeaderActions>
                <GsMenu>
                  <template #trigger>
                    <GsButton variant="icon" :aria-label="\`Actions for \${card.title}\`">
                      <GsIcon size="small"><KebabIcon /></GsIcon>
                    </GsButton>
                  </template>
                  <GsMenuItem label="Edit" @select="handleEditCard(card.id)" />
                  <GsMenuItem label="Delete" @select="handleDeleteCard(card.id)" />
                </GsMenu>
              </GsKanbanCardHeaderActions>
            </GsKanbanCardHeader>
            <GsKanbanCardBody>{{ card.body }}</GsKanbanCardBody>`,
            after: `
    <GsKanbanColumnActions @add-card="handleAddCard(column.id)" />`,
          })}
          </GsKanbanColumnContainer>
        </GsKanban>
      </div>`,
  }),
}

/**
 * Glideslope extra: `GsKanbanCardMoveMenu` moves a card up, down or to another column without
 * dragging, the single-pointer alternative to dragging. After a move, the card keeps the focus.
 */
export const MoveWithoutDragging: Story = {
  render: (args) => ({
    components,
    setup: () => ({ columns: ref(copy(args.columns)) }),
    template: `
      <div class="h-screen">
        <GsKanban v-model:columns="columns">
          <GsKanbanHeader>
            <GsKanbanHeaderTitle>Project Board</GsKanbanHeaderTitle>
          </GsKanbanHeader>
          <GsKanbanColumnContainer>${column({
            cards: `
            <GsKanbanCardHeader>
              <GsKanbanCardHeaderTitle>{{ card.title }}</GsKanbanCardHeaderTitle>
              <GsKanbanCardHeaderActions>
                <GsKanbanCardMoveMenu :card="card" />
              </GsKanbanCardHeaderActions>
            </GsKanbanCardHeader>
            <GsKanbanCardBody>{{ card.body }}</GsKanbanCardBody>`,
          })}
          </GsKanbanColumnContainer>
        </GsKanban>
      </div>`,
  }),
}
