import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vite-plus/test'
import { defineComponent, h, ref, type Component } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsTree from './GsTree.vue'
import GsTreeItem from './GsTreeItem.vue'
import GsTreeItemActions from './GsTreeItemActions.vue'
import GsTreeItemDescription from './GsTreeItemDescription.vue'
import GsTreeItemLabel from './GsTreeItemLabel.vue'
import type { GsTreeItemSlotProps, GsTreeKey, GsTreeNode } from './types'

const files = (): GsTreeNode<{ size?: string }>[] => [
  {
    key: 'documents',
    label: 'Documents',
    children: [
      {
        key: 'work',
        label: 'Work',
        children: [
          { key: 'report', label: 'Report', values: { size: '2.4 MB' } },
          { key: 'slides', label: 'Slides', values: { size: '5.1 MB' } },
        ],
      },
      {
        key: 'personal',
        label: 'Personal',
        children: [
          { key: 'photo', label: 'Photo' },
          { key: 'locked', label: 'Locked', disabled: true },
        ],
      },
    ],
  },
  { key: 'downloads', label: 'Downloads', children: [{ key: 'installer', label: 'Installer' }] },
]

interface Options {
  selected?: GsTreeKey[]
  expanded?: GsTreeKey[]
  visible?: GsTreeKey[]
  props?: Record<string, unknown>
  slot?: (props: GsTreeItemSlotProps<{ size?: string }>) => unknown
}

function renderTree({
  selected = [],
  expanded = [],
  visible = [],
  props = {},
  slot,
}: Options = {}) {
  const models = {
    selected: ref<GsTreeKey[]>(selected),
    expanded: ref<GsTreeKey[]>(expanded),
    visible: ref<GsTreeKey[]>(visible),
  }
  const result = render(() =>
    h(
      GsTree as Component,
      {
        items: files(),
        'aria-label': 'Files',
        ...props,
        modelValue: models.selected.value,
        'onUpdate:modelValue': (keys: GsTreeKey[]) => (models.selected.value = keys),
        expanded: models.expanded.value,
        'onUpdate:expanded': (keys: GsTreeKey[]) => (models.expanded.value = keys),
        visible: models.visible.value,
        'onUpdate:visible': (keys: GsTreeKey[]) => (models.visible.value = keys),
      },
      slot ? { default: slot } : undefined,
    ),
  )
  return { ...models, ...result }
}

const row = (name: string) => screen.getByRole('treeitem', { name })
const chevron = (item: HTMLElement) => item.querySelector<HTMLElement>('.expansion')!

describe('GsTree', () => {
  it('renders the expanded part of a nested tree', () => {
    renderTree({ expanded: ['documents', 'work'] })
    const tree = screen.getByRole('tree', { name: 'Files' })
    expect(tree).toHaveAttribute('aria-multiselectable', 'true')
    expect(
      within(tree)
        .getAllByRole('treeitem')
        .map((item) => item.textContent),
    ).toEqual(['Documents', 'Work', 'Report', 'Slides', 'Personal', 'Downloads'])
    expect(row('Documents')).toHaveAttribute('aria-expanded', 'true')
    expect(row('Downloads')).toHaveAttribute('aria-expanded', 'false')
    expect(row('Report')).toHaveAttribute('aria-level', '3')
    expect(row('Report')).not.toHaveAttribute('aria-expanded')
  })

  it('expands and collapses with the chevron', async () => {
    const { expanded, selected } = renderTree()
    expect(screen.queryByRole('treeitem', { name: 'Installer' })).not.toBeInTheDocument()

    await userEvent.click(chevron(row('Downloads')))
    expect(expanded.value).toEqual(['downloads'])
    expect(await screen.findByRole('treeitem', { name: 'Installer' })).toBeInTheDocument()
    expect(row('Downloads')).toHaveFocus()
    expect(selected.value).toEqual([])

    await userEvent.click(chevron(row('Downloads')))
    expect(expanded.value).toEqual([])
    await waitFor(() =>
      expect(screen.queryByRole('treeitem', { name: 'Installer' })).not.toBeInTheDocument(),
    )
  })

  it('selects on row click, and expands on row click only without selection', async () => {
    const first = renderTree()
    await userEvent.click(row('Downloads'))
    expect(first.selected.value).toEqual(['downloads'])
    expect(first.expanded.value).toEqual([])
    first.unmount()

    const second = renderTree({ props: { selectionMode: 'none' } })
    expect(document.querySelector('.selection')).not.toBeInTheDocument()
    await userEvent.click(row('Downloads'))
    expect(second.selected.value).toEqual([])
    expect(second.expanded.value).toEqual(['downloads'])
    expect(row('Downloads')).toHaveAttribute('aria-selected', 'false')
  })

  it('navigates, expands and selects with the keyboard', async () => {
    const user = userEvent.setup()
    const { expanded, selected } = renderTree()

    await user.tab()
    expect(row('Documents')).toHaveFocus()

    await user.keyboard('{ArrowRight}')
    expect(expanded.value).toEqual(['documents'])
    await waitFor(() => expect(row('Documents')).toHaveAttribute('aria-expanded', 'true'))

    await user.keyboard('{ArrowDown}')
    await waitFor(() => expect(row('Work')).toHaveFocus())
    await user.keyboard(' ')
    expect(selected.value).toEqual(['work'])
    expect(row('Work')).toHaveAttribute('aria-selected', 'true')

    await user.keyboard('{ArrowLeft}')
    await waitFor(() => expect(row('Documents')).toHaveFocus())
    await user.keyboard('{ArrowLeft}')
    expect(expanded.value).toEqual([])

    await user.keyboard('{Enter}')
    expect(selected.value).toEqual(['work', 'documents'])
  })

  it('toggles expansion with Enter when selection is off', async () => {
    const user = userEvent.setup()
    const { expanded } = renderTree({ props: { selectionMode: 'none' } })
    await user.tab()
    await user.keyboard('{Enter}')
    expect(expanded.value).toEqual(['documents'])
  })

  it('toggles multiple selections, or replaces the selection in single mode', async () => {
    const multiple = renderTree({ expanded: ['documents', 'work'] })
    await userEvent.click(row('Report'))
    await userEvent.click(row('Slides'))
    expect(multiple.selected.value).toEqual(['report', 'slides'])
    await userEvent.click(row('Report'))
    expect(multiple.selected.value).toEqual(['slides'])
    expect(row('Report')).toHaveAttribute('aria-selected', 'false')
    expect(row('Slides')).toHaveAttribute('aria-selected', 'true')
    multiple.unmount()

    const single = renderTree({
      expanded: ['documents', 'work'],
      props: { selectionMode: 'single' },
    })
    expect(screen.getByRole('tree')).not.toHaveAttribute('aria-multiselectable')
    await userEvent.click(row('Report'))
    await userEvent.click(row('Slides'))
    expect(single.selected.value).toEqual(['slides'])
    await waitFor(() => expect(row('Slides')).toHaveAttribute('aria-selected', 'true'))
    expect(row('Report')).toHaveAttribute('aria-selected', 'false')
  })

  describe('cascading selection', () => {
    const expanded = ['documents', 'work', 'personal']
    const props = { selectionCascade: true }

    it('selects descendants and marks partially selected ancestors', async () => {
      const { selected } = renderTree({ expanded, props })
      await userEvent.click(row('Work'))
      expect(selected.value).toEqual(['work', 'report', 'slides'])
      expect(row('Slides')).toHaveAttribute('aria-selected', 'true')
      await waitFor(() => expect(row('Documents')).toHaveAttribute('data-indeterminate'))
      expect(row('Documents').querySelector('.selection')).toHaveAttribute(
        'data-state',
        'indeterminate',
      )

      await userEvent.click(row('Report'))
      expect(selected.value).toEqual(['slides'])
      await waitFor(() => expect(row('Work')).toHaveAttribute('data-indeterminate'))
      expect(row('Work')).toHaveAttribute('aria-selected', 'false')
    })

    it('selects a parent once its enabled children are selected, skipping disabled ones', async () => {
      const { selected } = renderTree({ expanded, props })
      await userEvent.click(row('Photo'))
      expect(selected.value).toEqual(['personal', 'photo'])
      await waitFor(() => expect(row('Personal')).toHaveAttribute('aria-selected', 'true'))
      expect(row('Personal')).not.toHaveAttribute('data-indeterminate')
      expect(row('Locked')).toHaveAttribute('aria-selected', 'false')

      await userEvent.click(row('Documents'))
      expect(selected.value).toEqual(['documents', 'work', 'report', 'slides', 'personal', 'photo'])
    })
  })

  describe('visibility', () => {
    const expanded = ['documents', 'work']
    const props = { showVisibility: true }

    it('toggles a row with its eye button and mutes hidden subtrees', async () => {
      const { visible, selected } = renderTree({
        expanded,
        visible: ['documents', 'work', 'report'],
        props,
      })
      const work = screen.getByRole('treeitem', { name: /Work/ })
      expect(work).toHaveAttribute('data-viewable')

      await userEvent.click(screen.getByRole('button', { name: 'Hide Documents' }))
      expect(visible.value).toEqual(['work', 'report'])
      expect(selected.value).toEqual([])
      expect(await screen.findByRole('button', { name: 'Show Documents' })).toBeInTheDocument()

      // Descendants keep their own flags but are no longer viewable.
      expect(work).toHaveAttribute('data-visible')
      await waitFor(() => expect(work).not.toHaveAttribute('data-viewable'))
      expect(screen.getByRole('button', { name: 'Hide Work' })).toBeInTheDocument()

      await userEvent.click(screen.getByRole('button', { name: 'Show Documents' }))
      expect(visible.value).toEqual(['work', 'report', 'documents'])
      await waitFor(() => expect(work).toHaveAttribute('data-viewable'))
    })

    it('treats every row as visible without show-visibility', () => {
      renderTree({ expanded })
      expect(screen.queryByRole('button', { name: /Hide|Show/ })).not.toBeInTheDocument()
      for (const item of screen.getAllByRole('treeitem')) {
        expect(item).toHaveAttribute('data-viewable')
      }
    })
  })

  describe('disabled items', () => {
    it('cannot be selected, expanded or toggled', async () => {
      const { selected, visible } = renderTree({
        expanded: ['documents', 'personal'],
        props: { showVisibility: true, disabledKeys: ['downloads'] },
      })
      const locked = screen.getByRole('treeitem', { name: /Locked/ })
      expect(locked).toHaveAttribute('aria-disabled', 'true')
      await userEvent.click(locked)
      expect(selected.value).toEqual([])
      expect(within(locked).getByRole('button', { name: 'Show Locked' })).toBeDisabled()

      const downloads = screen.getByRole('treeitem', { name: /Downloads/ })
      expect(downloads).toHaveAttribute('aria-disabled', 'true')
      await userEvent.click(downloads)
      expect(selected.value).toEqual([])
      expect(chevron(downloads)).toBeDisabled()
      expect(visible.value).toEqual([])
    })

    it('disables every item when the tree is disabled', () => {
      renderTree({ props: { disabled: true } })
      for (const item of screen.getAllByRole('treeitem')) {
        expect(item).toHaveAttribute('aria-disabled', 'true')
      }
    })
  })

  describe('rule lines', () => {
    it('draws one connector per level and hides lines of last ancestors', () => {
      renderTree({ expanded: ['documents', 'personal', 'downloads'] })
      const lines = (name: string) => [...row(name).querySelectorAll('.lines')]
      expect(lines('Documents')).toHaveLength(0)

      const photo = lines('Photo')
      expect(photo).toHaveLength(3)
      expect(photo.map((line) => line.classList.contains('vert'))).toEqual([true, true, false])
      // Documents has a later sibling, Personal doesn't.
      expect(photo.map((line) => line.hasAttribute('data-hidden'))).toEqual([false, true, false])
      expect(lines('Locked')[2]).toHaveClass('last')

      const installer = lines('Installer')
      expect(installer[0]).toHaveAttribute('data-hidden')
      expect(installer[1]).toHaveClass('last')
    })

    it('keeps the indentation but hides the lines when turned off', () => {
      renderTree({ expanded: ['documents'], props: { showRuleLines: false } })
      const lines = row('Work').querySelectorAll('.lines')
      expect(lines).toHaveLength(2)
      for (const line of lines) expect(line).toHaveAttribute('data-hidden')
    })
  })

  describe('row content', () => {
    const slot = ({ node, level, selected }: GsTreeItemSlotProps<{ size?: string }>) => [
      h(GsTreeItemLabel, () => node.label),
      node.values?.size ? h(GsTreeItemDescription, () => node.values?.size) : null,
      h(GsTreeItemActions, () =>
        h(GsButton, { variant: 'icon', 'aria-label': `Open ${node.label}` }, () => 'open'),
      ),
      h('span', { 'data-testid': `meta-${node.key}` }, `${level}:${selected}`),
    ]

    it('renders the slot with row state and sizes action buttons to the density', async () => {
      const { selected } = renderTree({ expanded: ['documents', 'work'], slot })
      expect(screen.getByText('2.4 MB')).toHaveAttribute('data-slot', 'description')
      expect(screen.getByTestId('meta-report')).toHaveTextContent('3:false')
      expect(screen.getByRole('button', { name: 'Open Report' })).toHaveAttribute(
        'data-size',
        'medium',
      )

      // Clicking an action doesn't select the row.
      await userEvent.click(screen.getByRole('button', { name: 'Open Report' }))
      expect(selected.value).toEqual([])
      await userEvent.click(screen.getByText('2.4 MB'))
      expect(selected.value).toEqual(['report'])
      expect(await screen.findByText('3:true')).toBeInTheDocument()
    })

    it('names rows from their label and description, not their buttons', async () => {
      renderTree({ expanded: ['documents', 'work'], props: { showVisibility: true }, slot })
      expect(await screen.findByRole('treeitem', { name: 'Report 2.4 MB' })).toBeInTheDocument()
      // The Show and Open buttons inside the row aren't part of its name.
      expect(screen.queryByRole('treeitem', { name: /Open|Show/ })).toBeNull()
    })

    it('lets Tab reach row controls only in the focused row', async () => {
      renderTree({ expanded: ['documents', 'work'], props: { showVisibility: true }, slot })
      row('Report').focus()
      await waitFor(() => {
        expect(screen.getByRole('button', { name: 'Open Report' })).toHaveAttribute('tabindex', '0')
        expect(screen.getByRole('button', { name: 'Show Report' })).toHaveAttribute('tabindex', '0')
      })
      expect(screen.getByRole('button', { name: 'Open Slides' })).toHaveAttribute('tabindex', '-1')
      expect(screen.getByRole('button', { name: 'Show Slides' })).toHaveAttribute('tabindex', '-1')

      await userEvent.keyboard('{ArrowDown}')
      await waitFor(() =>
        expect(screen.getByRole('button', { name: 'Open Slides' })).toHaveAttribute(
          'tabindex',
          '0',
        ),
      )
      expect(screen.getByRole('button', { name: 'Open Report' })).toHaveAttribute('tabindex', '-1')
    })

    it('hides descriptions and shrinks controls when crammed', () => {
      renderTree({ expanded: ['documents', 'work'], props: { variant: 'crammed' }, slot })
      expect(screen.queryByText('2.4 MB')).not.toBeInTheDocument()
      expect(screen.getByText('Report')).toHaveClass('label')
      expect(screen.getByRole('button', { name: 'Open Report' })).toHaveAttribute(
        'data-size',
        'small',
      )
      expect(screen.getByRole('treeitem', { name: /^Report/ })).toHaveClass(
        'item',
        'crammed',
        'group/tree-item',
      )
    })

    it('passes native listeners and attributes to the tree element', async () => {
      const onFocusin = vi.fn()
      renderTree({ props: { class: 'w-full', onFocusin } })
      expect(screen.getByRole('tree')).toHaveClass('tree', 'w-full')
      await userEvent.tab()
      expect(onFocusin).toHaveBeenCalled()
    })
  })
})

describe('GsTree initial state from node flags', () => {
  const flagged = (): GsTreeNode[] => [
    {
      key: 'documents',
      label: 'Documents',
      expanded: true,
      visible: true,
      children: [
        { key: 'report', label: 'Report', selected: true, visible: true },
        { key: 'slides', label: 'Slides', selected: true },
      ],
    },
    { key: 'downloads', label: 'Downloads', children: [{ key: 'installer', label: 'Installer' }] },
  ]
  const eye = (name: string) => within(row(name)).getByRole('button', { name: /^(Show|Hide) / })

  it('starts an unbound tree from the flags, then keeps its own state', async () => {
    render(GsTree, { props: { items: flagged(), showVisibility: true, 'aria-label': 'Files' } })
    expect(row('Documents')).toHaveAttribute('aria-expanded', 'true')
    expect(row('Report')).toHaveAttribute('aria-selected', 'true')
    expect(row('Slides')).toHaveAttribute('aria-selected', 'true')
    expect(row('Downloads')).toHaveAttribute('aria-selected', 'false')
    expect(eye('Report')).toHaveAccessibleName('Hide Report')
    expect(eye('Slides')).toHaveAccessibleName('Show Slides')

    await userEvent.click(row('Report'))
    expect(row('Report')).toHaveAttribute('aria-selected', 'false')
    await userEvent.click(chevron(row('Downloads')))
    expect(await screen.findByRole('treeitem', { name: 'Installer' })).toBeInTheDocument()
  })

  it('keeps only the first flagged node in single selection', () => {
    render(GsTree, { props: { items: flagged(), selectionMode: 'single', 'aria-label': 'Files' } })
    expect(row('Report')).toHaveAttribute('aria-selected', 'true')
    expect(row('Slides')).toHaveAttribute('aria-selected', 'false')
  })

  it('ignores the flags of a bound model', () => {
    render(() =>
      h(GsTree as Component, {
        items: flagged(),
        'aria-label': 'Files',
        modelValue: [],
        expanded: ['downloads'],
      }),
    )
    expect(row('Documents')).toHaveAttribute('aria-expanded', 'false')
    expect(row('Downloads')).toHaveAttribute('aria-expanded', 'true')
    expect(screen.queryByRole('treeitem', { name: 'Report' })).not.toBeInTheDocument()
  })
})

describe('GsTree markup', () => {
  /** A tree written as nested GsTreeItems. */
  function renderMarkup(
    options: {
      props?: Record<string, unknown>
      expanded?: GsTreeKey[]
      showCarrot?: () => boolean
      label?: () => string
    } = {},
  ) {
    const expanded = ref<GsTreeKey[]>(options.expanded ?? ['fruit', 'vegetables'])
    const selected = ref<GsTreeKey[]>([])
    const result = render(() =>
      h(
        GsTree as Component,
        {
          'aria-label': 'Produce',
          ...options.props,
          modelValue: selected.value,
          'onUpdate:modelValue': (keys: GsTreeKey[]) => (selected.value = keys),
          expanded: expanded.value,
          'onUpdate:expanded': (keys: GsTreeKey[]) => (expanded.value = keys),
        },
        () => [
          h(GsTreeItem, { value: 'fruit', label: options.label?.() ?? 'Fruit' }, () => [
            h(GsTreeItem, { value: 'apples', label: 'Apples' }),
            h(GsTreeItem, { value: 'pears', label: 'Pears', disabled: true }),
          ]),
          h(
            GsTreeItem,
            { value: 'vegetables', label: 'Vegetables' },
            {
              default: () => [
                options.showCarrot?.() ? h(GsTreeItem, { value: 'carrot', label: 'Carrot' }) : null,
                h(GsTreeItem, { value: 'kale', label: 'Kale' }),
              ],
              content: ({ selected: isSelected, level }: GsTreeItemSlotProps) => [
                h(GsTreeItemLabel, () => 'Vegetables'),
                h(
                  GsTreeItemDescription,
                  () => `level ${level}, ${isSelected ? 'picked' : 'not picked'}`,
                ),
              ],
            },
          ),
        ],
      ),
    )
    return { ...result, expanded, selected }
  }

  const names = () =>
    screen
      .getAllByRole('treeitem')
      .map((item) => item.getAttribute('aria-level') + ' ' + item.textContent)

  it('renders rows from nested GsTreeItems, in order and nested', async () => {
    renderMarkup()
    expect(await screen.findByRole('treeitem', { name: 'Apples' })).toHaveAttribute(
      'aria-level',
      '2',
    )
    expect(names()).toEqual([
      '1 Fruit',
      '2 Apples',
      '2 Pears',
      '1 Vegetables level 1, not picked',
      '2 Kale',
    ])
    expect(row('Fruit')).toHaveAttribute('aria-expanded', 'true')
    expect(row('Pears')).toHaveAttribute('aria-disabled', 'true')
    // The markup itself is hidden.
    expect(screen.getByRole('tree').querySelector('li[hidden]')).toBeInTheDocument()
  })

  it('fills rows with the #content slot and its row state', async () => {
    renderMarkup()
    const vegetables = await screen.findByRole('treeitem', {
      name: 'Vegetables level 1, not picked',
    })
    await userEvent.click(vegetables)
    expect(row('Vegetables level 1, picked')).toHaveAttribute('aria-selected', 'true')
  })

  it('selects, cascades and expands like a data-driven tree', async () => {
    const { selected, expanded } = renderMarkup({
      expanded: [],
      props: { selectionCascade: true },
    })
    await userEvent.click(await screen.findByRole('treeitem', { name: 'Fruit' }))
    // Pears is disabled, so the cascade skips it.
    expect(selected.value).toEqual(['fruit', 'apples'])

    row('Fruit').focus()
    await userEvent.keyboard('{ArrowDown}{ArrowRight}')
    expect(expanded.value).toEqual(['vegetables'])
    expect(await screen.findByRole('treeitem', { name: 'Kale' })).toBeInTheDocument()
  })

  it('puts an item that mounts later in document order', async () => {
    const showCarrot = ref(false)
    renderMarkup({ showCarrot: () => showCarrot.value })
    await screen.findByRole('treeitem', { name: 'Kale' })
    showCarrot.value = true
    expect(await screen.findByRole('treeitem', { name: 'Carrot' })).toBeInTheDocument()
    await waitFor(() => expect(names().slice(-2)).toEqual(['2 Carrot', '2 Kale']))
    // Kale is still the last child, so it draws the closing connector.
    expect(row('Kale').querySelectorAll('.lines')[1]).toHaveClass('last')
    expect(row('Carrot').querySelectorAll('.lines')[1]).toHaveClass('branch')

    showCarrot.value = false
    await waitFor(() =>
      expect(screen.queryByRole('treeitem', { name: 'Carrot' })).not.toBeInTheDocument(),
    )
  })

  it('follows changes to an item', async () => {
    const label = ref('Fruit')
    renderMarkup({ label: () => label.value })
    await screen.findByRole('treeitem', { name: 'Fruit' })
    label.value = 'Orchard'
    expect(await screen.findByRole('treeitem', { name: 'Orchard' })).toBeInTheDocument()
  })

  it('takes GsTreeItems rendered by other components', async () => {
    const Folder = defineComponent({
      props: { name: { type: String, required: true } },
      setup:
        (props, { slots }) =>
        () =>
          h(GsTreeItem, { value: props.name.toLowerCase(), label: props.name }, slots),
    })
    render(() =>
      h(GsTree as Component, { 'aria-label': 'Folders', expanded: ['work'] }, () => [
        h(Folder, { name: 'Work' }, () => h(Folder, { name: 'Reports' })),
        h(Folder, { name: 'Personal' }),
      ]),
    )
    expect(await screen.findByRole('treeitem', { name: 'Reports' })).toHaveAttribute(
      'aria-level',
      '2',
    )
    expect(screen.getAllByRole('treeitem').map((item) => item.textContent)).toEqual([
      'Work',
      'Reports',
      'Personal',
    ])
  })

  it('refuses a GsTreeItem outside a tree written in markup', () => {
    vi.spyOn(console, 'warn').mockImplementation(() => {})
    expect(() => render(GsTreeItem, { props: { value: 'a', label: 'A' } })).toThrow(
      'GsTreeItem must be inside a GsTree without items',
    )
  })
})
