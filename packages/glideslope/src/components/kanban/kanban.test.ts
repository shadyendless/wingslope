import '../tree/__fixtures__/dnd-env'
import { render, screen, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'
import { computed, defineComponent, h, ref, type Ref } from 'vue'
import { settle } from '../tree/__fixtures__/dnd-env'
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
import GsKanbanHeaderSearch from './GsKanbanHeaderSearch.vue'
import GsKanbanHeaderTitle from './GsKanbanHeaderTitle.vue'
import { useKanban, type UseKanban } from './context'
import { getInsertIndex, getKanbanCardMap, moveKanbanCard, validateMoveCard } from './kanban-data'
import type { GsKanbanCardData, GsKanbanColumnData } from './types'

const card = (id: string, columnId: string, position: number): GsKanbanCardData => ({
  id,
  title: `Card ${id}`,
  body: `Body ${id}`,
  columnId,
  position,
})

/** todo: a, b, c · doing: d, e · review: (empty) · done: f · locked (canDrop false): g */
const board = (): GsKanbanColumnData[] => [
  { id: 'todo', title: 'To Do', cards: ['a', 'b', 'c'].map((id, i) => card(id, 'todo', i)) },
  { id: 'doing', title: 'Doing', cards: ['d', 'e'].map((id, i) => card(id, 'doing', i)) },
  { id: 'review', title: 'Review', cards: [] },
  { id: 'done', title: 'Done', cards: [card('f', 'done', 0)] },
  { id: 'locked', title: 'Locked', canDrop: false, cards: [card('g', 'locked', 0)] },
]

/** Each column's card ids, and whether every card's `columnId` and `position` match. */
const layout = (columns: GsKanbanColumnData[]) => {
  const consistent = columns.every((column) =>
    column.cards.every((c, i) => c.columnId === column.id && c.position === i),
  )
  return {
    consistent,
    ...Object.fromEntries(columns.map((column) => [column.id, column.cards.map((c) => c.id)])),
  }
}

afterEach(() => {
  vi.restoreAllMocks()
})

describe('kanban data', () => {
  it('maps cards to their column and index', () => {
    const map = getKanbanCardMap(board())
    expect(map.get('e')).toMatchObject({ column: { id: 'doing' }, index: 1, card: { id: 'e' } })
    expect(map.size).toBe(7)
  })

  it('inserts at a position, or after it for the bottom edge', () => {
    expect(getInsertIndex(3)).toBe(3)
    expect(getInsertIndex(3, 'top')).toBe(3)
    expect(getInsertIndex(3, 'bottom')).toBe(4)
    expect(getInsertIndex(0, 'bottom')).toBe(1)
  })

  it('validates moves', () => {
    const columns = board()
    expect(validateMoveCard(columns, '', 'todo', 0)).toMatchObject({ success: false })
    expect(validateMoveCard(columns, 'a', '', 0)).toMatchObject({ success: false })
    expect(validateMoveCard(columns, 'a', 'todo', Number.NaN)).toMatchObject({ success: false })
    expect(validateMoveCard(columns, 'zz', 'todo', 0).errors[0]).toMatch(/Card "zz" not found/)
    expect(validateMoveCard(columns, 'a', 'zz', 0).errors[0]).toMatch(/column "zz" not found/)
    expect(validateMoveCard(columns, 'a', 'locked', 0).errors[0]).toMatch(/does not accept/)

    const warn = vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(validateMoveCard(columns, 'a', 'doing', -2)).toMatchObject({ adjustedPosition: 0 })
    expect(validateMoveCard(columns, 'a', 'doing', 9)).toMatchObject({ adjustedPosition: 2 })
    expect(warn).toHaveBeenCalledTimes(2)
  })

  describe('moving a card', () => {
    const moved = (
      ...args: Parameters<typeof moveKanbanCard> extends [unknown, ...infer R] ? R : never
    ) => layout(moveKanbanCard(board(), ...args)!)

    it('moves down and up within a column', () => {
      // Down: the card leaves first, so the target index shifts.
      expect(moved('a', 'todo', 2, 'bottom')).toMatchObject({ todo: ['b', 'c', 'a'] })
      expect(moved('a', 'todo', 1, 'bottom')).toMatchObject({ todo: ['b', 'a', 'c'] })
      expect(moved('c', 'todo', 0, 'top')).toMatchObject({ todo: ['c', 'a', 'b'] })
      expect(moved('c', 'todo', 1)).toMatchObject({ todo: ['a', 'c', 'b'] })
      expect(moved('a', 'todo', 3)).toMatchObject({ todo: ['b', 'c', 'a'] })
    })

    it('leaves a card dropped on itself in place', () => {
      expect(moved('b', 'todo', 1, 'top')).toMatchObject({ todo: ['a', 'b', 'c'] })
      expect(moved('b', 'todo', 1, 'bottom')).toMatchObject({ todo: ['a', 'b', 'c'] })
      expect(moved('c', 'todo', 2, 'bottom')).toMatchObject({ todo: ['a', 'b', 'c'] })
    })

    it('moves between columns, into empty ones and to the end', () => {
      expect(moved('a', 'doing', 1, 'top')).toMatchObject({
        todo: ['b', 'c'],
        doing: ['d', 'a', 'e'],
      })
      expect(moved('a', 'doing', 1, 'bottom')).toMatchObject({ doing: ['d', 'e', 'a'] })
      expect(moved('a', 'doing', 2)).toMatchObject({ doing: ['d', 'e', 'a'] })
      expect(moved('e', 'review', 0)).toMatchObject({ doing: ['d'], review: ['e'] })
      expect(moved('f', 'todo', 0)).toMatchObject({ todo: ['f', 'a', 'b', 'c'], done: [] })
    })

    it('renumbers columnId and position, and keeps the other card properties', () => {
      const columns = board()
      columns[0]!.cards[0]!.active = true
      const next = moveKanbanCard(columns, 'a', 'doing', 0)!
      expect(layout(next).consistent).toBe(true)
      expect(next[1]!.cards[0]).toEqual({ ...card('a', 'doing', 0), active: true })
      // Untouched columns and cards are shared.
      expect(next[3]).toBe(columns[3])
      expect(next[1]!.cards[1]).not.toBe(columns[1]!.cards[0])
      expect(columns[0]!.cards.map((c) => c.id)).toEqual(['a', 'b', 'c'])
    })

    it('stays consistent across moves', () => {
      let columns = board()
      for (const [id, column, position] of [
        ['a', 'doing', 0],
        ['d', 'review', 0],
        ['b', 'review', 1],
        ['a', 'todo', 1],
      ] as const) {
        columns = moveKanbanCard(columns, id, column, position)!
      }
      expect(layout(columns)).toEqual({
        consistent: true,
        todo: ['c', 'a'],
        doing: ['e'],
        review: ['d', 'b'],
        done: ['f'],
        locked: ['g'],
      })
    })

    it('refuses invalid moves', () => {
      expect(moveKanbanCard(board(), 'zz', 'todo', 0)).toBeUndefined()
      expect(moveKanbanCard(board(), 'a', 'locked', 0)).toBeUndefined()
    })
  })
})

const components = {
  GsKanban,
  GsKanbanHeader,
  GsKanbanHeaderTitle,
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
}

interface BoardOptions {
  columns?: GsKanbanColumnData[]
  query?: string
  /** Rendered in every card's header actions. */
  actions?: string
  onAddCard?: (columnId: string) => void
}

function renderBoard({
  columns: initial = board(),
  query = '',
  actions = '',
  onAddCard,
}: BoardOptions = {}) {
  const columns = ref(initial) as Ref<GsKanbanColumnData[]>
  const search = ref(query)
  const Board = defineComponent({
    components,
    setup: () => ({
      columns,
      search,
      onAddCard: (id: string) => onAddCard?.(id),
      shown: computed(() =>
        columns.value.map((column) => ({
          ...column,
          cards: column.cards.filter((c) => c.title.toLowerCase().includes(search.value)),
        })),
      ),
    }),
    template: `
      <GsKanban v-model:columns="columns" aria-label="Project board">
        <GsKanbanHeader>
          <GsKanbanHeaderTitle>Project Board</GsKanbanHeaderTitle>
          <GsKanbanHeaderSearch v-model="search" placeholder="Search" />
        </GsKanbanHeader>
        <GsKanbanColumnContainer>
          <GsKanbanColumn v-for="column in shown" :key="column.id" :column="column">
            <GsKanbanColumnHeader>
              <GsKanbanColumnHeaderTitle>{{ column.title }}</GsKanbanColumnHeaderTitle>
              <GsKanbanColumnHeaderActions :card-count="column.cards.length" />
            </GsKanbanColumnHeader>
            <GsKanbanColumnContent :column="column">
              <GsKanbanCard v-for="card in column.cards" :key="card.id" :card="card">
                <GsKanbanCardHeader>
                  <GsKanbanCardHeaderTitle>{{ card.title }}</GsKanbanCardHeaderTitle>
                  <GsKanbanCardHeaderActions>${actions}</GsKanbanCardHeaderActions>
                </GsKanbanCardHeader>
                <GsKanbanCardBody>{{ card.body }}</GsKanbanCardBody>
              </GsKanbanCard>
            </GsKanbanColumnContent>
            <GsKanbanColumnActions @add-card="onAddCard(column.id)" />
          </GsKanbanColumn>
        </GsKanbanColumnContainer>
      </GsKanban>`,
  })
  return { ...render(Board), columns, search, user: userEvent.setup() }
}

const column = (name: string) => screen.getByRole('group', { name })
const cardsIn = (name: string) =>
  within(column(name))
    .queryAllByRole('listitem')
    .map((item) => item.getAttribute('aria-label'))
const cardItem = (title: string) => screen.getByRole('listitem', { name: title })

describe('GsKanban', () => {
  it('renders columns as named groups of focusable cards', async () => {
    renderBoard()
    expect(screen.getByRole('heading', { level: 3, name: 'Project Board' })).toBeInTheDocument()
    expect(screen.getAllByRole('group')).toHaveLength(5)
    expect(cardsIn('To Do')).toEqual(['Card a', 'Card b', 'Card c'])
    expect(cardsIn('Review')).toEqual([])
    expect(within(column('Doing')).getByText('2')).toBeInTheDocument()

    await settle()
    const item = cardItem('Card a')
    expect(item).toHaveAttribute('tabindex', '0')
    // dnd-kit describes the card, but leaves its role alone.
    expect(item).toHaveAttribute('role', 'listitem')
    expect(item).toHaveAttribute('aria-roledescription', 'draggable')
    const description = document.getElementById(item.getAttribute('aria-describedby')!)
    expect(description).toHaveTextContent(/use the arrow keys/)
    expect(item.querySelector('.card')).toHaveClass('card')
  })

  it('marks the current card, from its data or the active prop', () => {
    const columns = board()
    columns[0]!.cards[1]!.active = true
    renderBoard({ columns })
    expect(cardItem('Card b').querySelector('.card')).toHaveAttribute('data-current')
    expect(cardItem('Card a').querySelector('.card')).not.toHaveAttribute('data-current')
  })

  it('searches with a named field and adds cards with the column action', async () => {
    const onAddCard = vi.fn()
    const { user, search } = renderBoard({ onAddCard })
    await user.type(screen.getByRole('searchbox', { name: 'Search' }), 'card b')
    expect(search.value).toBe('card b')
    expect(cardsIn('To Do')).toEqual(['Card b'])

    await user.click(within(column('Review')).getByRole('button', { name: 'Add Card' }))
    expect(onAddCard).toHaveBeenCalledWith('review')
  })

  it('moves cards without dragging, from the move menu', async () => {
    const { user, columns } = renderBoard({ actions: '<GsKanbanCardMoveMenu :card="card" />' })
    const menu = async (title: string) => {
      await user.click(screen.getByRole('button', { name: `Move ${title}` }))
      return screen.getByRole('menu')
    }

    let items = within(await menu('Card a'))
    expect(items.getByRole('menuitem', { name: 'Move up' })).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(items.getByRole('menuitem', { name: 'Locked' })).toHaveAttribute('aria-disabled', 'true')
    expect(items.queryByRole('menuitem', { name: 'To Do' })).not.toBeInTheDocument()
    await user.click(items.getByRole('menuitem', { name: 'Move down' }))
    expect(layout(columns.value)).toMatchObject({ consistent: true, todo: ['b', 'a', 'c'] })

    items = within(await menu('Card a'))
    await user.click(items.getByRole('menuitem', { name: 'Review' }))
    expect(layout(columns.value)).toMatchObject({ todo: ['b', 'c'], review: ['a'] })
    await settle()
    expect(cardItem('Card a')).toHaveFocus()
  })

  it('moves past the cards a filtered column shows', async () => {
    const { user, columns } = renderBoard({
      query: 'card a',
      actions: '<GsKanbanCardMoveMenu :card="card" />',
      columns: [
        {
          id: 'todo',
          title: 'To Do',
          cards: [
            { ...card('a1', 'todo', 0), title: 'Card a1' },
            card('b', 'todo', 1),
            { ...card('a2', 'todo', 2), title: 'Card a2' },
          ],
        },
      ],
    })
    await user.click(screen.getByRole('button', { name: 'Move Card a1' }))
    await user.click(screen.getByRole('menuitem', { name: 'Move down' }))
    expect(layout(columns.value)).toMatchObject({ todo: ['b', 'a2', 'a1'] })
  })

  it('shares its state with useKanban, and refuses invalid moves', () => {
    let kanban: UseKanban | undefined
    const Probe = defineComponent({
      setup() {
        kanban = useKanban()
        return () => null
      },
    })
    const columns = ref(board())
    render(() =>
      h(
        GsKanban,
        {
          columns: columns.value,
          'onUpdate:columns': (next: GsKanbanColumnData[]) => (columns.value = next),
        },
        () => h(Probe),
      ),
    )
    expect(kanban!.getColumnById('done')?.title).toBe('Done')
    expect(kanban!.cardMap.value.get('f')?.index).toBe(0)
    expect(kanban!.activeCardId.value).toBeNull()
    expect(kanban!.moveCard('f', 'todo', 0)).toBe(true)
    expect(layout(columns.value)).toMatchObject({ todo: ['f', 'a', 'b', 'c'], done: [] })

    const error = vi.spyOn(console, 'error').mockImplementation(() => {})
    expect(kanban!.moveCard('a', 'locked', 0)).toBe(false)
    expect(error).toHaveBeenCalledWith(expect.stringMatching(/does not accept drops/))
  })

  it('requires a GsKanban around useKanban and the parts', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    const Probe = defineComponent({ setup: () => (useKanban(), () => null) })
    expect(() => render(Probe)).toThrow(/inside a GsKanban/)
  })
})

describe('GsKanban keyboard dragging', () => {
  /**
   * jsdom has no layout, and dnd-kit's keyboard sorting looks for the closest card in the arrow's
   * direction, so lay the board out: columns 220px apart, cards 60px apart, and the drag overlay
   * where dnd-kit's feedback puts it.
   */
  function fakeLayout() {
    const rect = (x: number, y: number, width: number, height: number) =>
      ({ x, y, left: x, top: y, width, height, right: x + width, bottom: y + height }) as DOMRect
    vi.spyOn(Element.prototype, 'getBoundingClientRect').mockImplementation(function (
      this: Element,
    ) {
      if (this instanceof HTMLElement && this.hasAttribute('data-dnd-overlay')) {
        const px = (name: string) => parseFloat(this.style.getPropertyValue(`--dnd-${name}`)) || 0
        const [tx = 0, ty = 0] = this.style
          .getPropertyValue('--dnd-translate')
          .split(' ')
          .map((value) => parseFloat(value) || 0)
        return rect(px('left') + tx, px('top') + ty, px('width'), px('height'))
      }
      const group = this.closest('[role="group"]')
      if (!group) return rect(0, 0, 0, 0)
      const x = [...document.querySelectorAll('[role="group"]')].indexOf(group) * 220
      if (this === group) return rect(x, 0, 200, 600)
      if (this.tagName === 'LI') {
        const items = [...this.parentElement!.children].filter((child) => child.tagName === 'LI')
        return rect(x + 5, 60 + items.indexOf(this) * 60, 190, 50)
      }
      return rect(0, 0, 0, 0)
    })
  }

  const announcement = () =>
    [...document.querySelectorAll('[id^="dnd-kit-announcement"]')].at(-1)?.textContent

  async function pickUp(user: ReturnType<typeof userEvent.setup>, title: string) {
    await settle()
    cardItem(title).focus()
    await user.keyboard(' ')
    await settle(50)
  }

  it('moves a card within its column', async () => {
    fakeLayout()
    const { user, columns } = renderBoard()
    await pickUp(user, 'Card b')
    expect(announcement()).toBe('Picked up card Card b, in To Do, position 2 of 3.')

    await user.keyboard('{ArrowDown}')
    await settle(600)
    expect(cardsIn('To Do')).toEqual(['Card a', 'Card c', 'Card b'])
    expect(announcement()).toBe('Card Card b is in To Do, position 3 of 3.')
    // The card's column is the target; the others that take cards are candidates.
    expect(column('To Do')).toHaveAttribute('data-drop-target')
    expect(column('Doing')).toHaveAttribute('data-highlighted')
    expect(column('Doing')).not.toHaveAttribute('data-drop-target')
    expect(column('Locked')).not.toHaveAttribute('data-highlighted')

    await user.keyboard('{Enter}')
    await settle(50)
    expect(layout(columns.value)).toMatchObject({ consistent: true, todo: ['a', 'c', 'b'] })
    expect(announcement()).toBe('Card Card b dropped in To Do, position 3 of 3.')
    expect(cardsIn('To Do')).toEqual(['Card a', 'Card c', 'Card b'])
    expect(cardItem('Card b')).toHaveFocus()
  })

  it('moves a card to the next column', async () => {
    fakeLayout()
    const { user, columns } = renderBoard()
    await pickUp(user, 'Card a')
    await user.keyboard('{ArrowRight}')
    await settle(50)
    await user.keyboard('{Enter}')
    await settle(50)
    expect(layout(columns.value)).toMatchObject({ consistent: true, todo: ['b', 'c'] })
    expect(columns.value[1]!.cards.map((c) => c.id)).toContain('a')
    expect(cardsIn('Doing')).toContain('Card a')
    expect(cardItem('Card a')).toHaveFocus()
  })

  it('drops into an empty column, but not into one that refuses cards', async () => {
    fakeLayout()
    const { user, columns } = renderBoard()
    await pickUp(user, 'Card e')
    await user.keyboard('{ArrowRight}')
    await settle(50)
    await user.keyboard('{Enter}')
    await settle(50)
    expect(layout(columns.value)).toMatchObject({ consistent: true, doing: ['d'], review: ['e'] })

    await pickUp(user, 'Card f')
    await user.keyboard('{ArrowRight}')
    await settle(50)
    await user.keyboard('{Enter}')
    await settle(50)
    expect(layout(columns.value)).toMatchObject({ done: ['f'], locked: ['g'] })
  })

  it("leaves no copy behind when a column's last card leaves it", async () => {
    // Optimistic sorting moves the card's element out of its list; once the list is empty, Vue
    // drops the slot's fragment by what lies between its anchors, which no longer includes it.
    fakeLayout()
    const { user, columns } = renderBoard({
      columns: [
        { id: 'todo', title: 'To Do', cards: [card('a', 'todo', 0)] },
        { id: 'doing', title: 'Doing', cards: ['b', 'c'].map((id, i) => card(id, 'doing', i)) },
      ],
    })
    await pickUp(user, 'Card a')
    await user.keyboard('{ArrowRight}')
    await settle(50)
    await user.keyboard('{Enter}')
    await settle(50)
    expect(layout(columns.value)).toMatchObject({ consistent: true, todo: [] })
    expect(columns.value[1]!.cards.map((c) => c.id)).toContain('a')
    expect(cardsIn('To Do')).toEqual([])
    expect(screen.getAllByRole('listitem', { name: 'Card a' })).toHaveLength(1)
    expect(cardsIn('Doing')).toEqual(columns.value[1]!.cards.map((c) => `Card ${c.id}`))
  })

  it('puts a cancelled card back', async () => {
    fakeLayout()
    const { user, columns } = renderBoard()
    const before = columns.value
    await pickUp(user, 'Card a')
    await user.keyboard('{ArrowDown}')
    await settle(50)
    await user.keyboard('{Escape}')
    await settle(50)
    expect(announcement()).toBe('Moving card Card a was cancelled.')
    expect(columns.value).toBe(before)
    expect(cardsIn('To Do')).toEqual(['Card a', 'Card b', 'Card c'])
  })
})
