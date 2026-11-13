import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { afterEach, describe, expect, it, vi } from 'vitest'
import { h, nextTick, ref } from 'vue'
import GsAccordion from './accordion/GsAccordion.vue'
import GsAccordionGroup from './accordion/GsAccordionGroup.vue'
import GsAccordionHeader from './accordion/GsAccordionHeader.vue'
import GsAccordionPanel from './accordion/GsAccordionPanel.vue'
import GsAccordionTrigger from './accordion/GsAccordionTrigger.vue'
import GsActionBar from './action-bar/GsActionBar.vue'
import GsBreadcrumbItem from './breadcrumbs/GsBreadcrumbItem.vue'
import GsBreadcrumbs from './breadcrumbs/GsBreadcrumbs.vue'
import GsButton from './button/GsButton.vue'
import GsList from './list/GsList.vue'
import GsListItem from './list/GsListItem.vue'
import GsNoticeList from './notice/GsNoticeList.vue'
import { useNotices } from './notice/use-notices'
import GsPagination from './pagination/GsPagination.vue'
import GsStepper from './stepper/GsStepper.vue'
import GsStepperBack from './stepper/GsStepperBack.vue'
import GsStepperList from './stepper/GsStepperList.vue'
import GsStepperNext from './stepper/GsStepperNext.vue'
import GsStepperPanel from './stepper/GsStepperPanel.vue'
import GsStepperStep from './stepper/GsStepperStep.vue'
import type { GsStepValue } from './stepper/types'
import GsTab from './tabs/GsTab.vue'
import GsTabList from './tabs/GsTabList.vue'
import GsTabPanel from './tabs/GsTabPanel.vue'
import GsTabs from './tabs/GsTabs.vue'

describe('GsTabs', () => {
  it('switches panels by click and arrow keys', async () => {
    render(GsTabs, {
      props: { modelValue: 'details' },
      slots: {
        default: () => [
          h(GsTabList, { 'aria-label': 'Views' }, () => [
            h(GsTab, { value: 'details' }, () => 'Details'),
            h(GsTab, { value: 'history' }, () => 'History'),
          ]),
          h(GsTabPanel, { value: 'details' }, () => 'Details panel'),
          h(GsTabPanel, { value: 'history' }, () => 'History panel'),
        ],
      },
    })
    expect(screen.getByRole('tablist', { name: 'Views' })).toBeInTheDocument()
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Details panel')

    await userEvent.click(screen.getByRole('tab', { name: 'History' }))
    expect(screen.getByRole('tabpanel')).toHaveTextContent('History panel')

    await userEvent.keyboard('{ArrowLeft}')
    expect(screen.getByRole('tab', { name: 'Details' })).toHaveAttribute('aria-selected', 'true')
  })
})

describe('GsTabs default selection', () => {
  it('selects the first enabled tab when nothing is selected', async () => {
    const tab = ref<string | number>()
    render(() =>
      h(
        GsTabs,
        {
          modelValue: tab.value,
          'onUpdate:modelValue': (v: string | number | undefined) => (tab.value = v),
        },
        () => [
          h(GsTabList, { 'aria-label': 'Views' }, () => [
            h(GsTab, { value: 'archive', disabled: true }, () => 'Archive'),
            h(GsTab, { value: 'details' }, () => 'Details'),
          ]),
          h(GsTabPanel, { value: 'archive' }, () => 'Archive panel'),
          h(GsTabPanel, { value: 'details' }, () => 'Details panel'),
        ],
      ),
    )
    await waitFor(() => expect(tab.value).toBe('details'))
    expect(await screen.findByRole('tabpanel')).toHaveTextContent('Details panel')
  })
})

describe('GsAccordion', () => {
  const section = (label: string, value?: string) =>
    h(GsAccordion, { value }, () => [
      h(GsAccordionHeader, null, () => h(GsAccordionTrigger, null, () => label)),
      h(GsAccordionPanel, null, () => `${label} content`),
    ])

  it('toggles on its own with v-model:open', async () => {
    const open = ref(false)
    render(() =>
      h(
        GsAccordion,
        { open: open.value, 'onUpdate:open': (v: boolean) => (open.value = v) },
        () => [
          h(GsAccordionHeader, null, () => h(GsAccordionTrigger, null, () => 'Sensors')),
          h(GsAccordionPanel, null, () => 'Radar'),
        ],
      ),
    )
    const button = screen.getByRole('button', { name: 'Sensors' })
    expect(button).toHaveAttribute('aria-expanded', 'false')
    await userEvent.click(button)
    expect(open.value).toBe(true)
    expect(screen.getByText('Radar')).toBeVisible()
  })

  it('opens one section at a time in a group', async () => {
    const model = ref<string | string[] | undefined>()
    render(() =>
      h(
        GsAccordionGroup,
        {
          modelValue: model.value,
          'onUpdate:modelValue': (v: string | string[] | undefined) => (model.value = v),
        },
        () => [section('Sensors', 'sensors'), section('Comms', 'comms')],
      ),
    )
    await userEvent.click(screen.getByRole('button', { name: 'Sensors' }))
    expect(model.value).toBe('sensors')
    await userEvent.click(screen.getByRole('button', { name: 'Comms' }))
    expect(model.value).toBe('comms')
    expect(screen.getByRole('button', { name: 'Sensors' })).toHaveAttribute(
      'aria-expanded',
      'false',
    )
  })
})

describe('GsBreadcrumbs', () => {
  it('renders a breadcrumb landmark with links and the current page', () => {
    render(GsBreadcrumbs, {
      slots: {
        default: () => [
          h(GsBreadcrumbItem, { href: '/missions' }, () => 'Missions'),
          h(GsBreadcrumbItem, { current: true }, () => 'Tracks'),
        ],
      },
    })
    const nav = screen.getByRole('navigation', { name: 'Breadcrumb' })
    expect(within(nav).getByRole('link', { name: 'Missions' })).toHaveAttribute('href', '/missions')
    expect(within(nav).getByText('Tracks').closest('li')).toHaveAttribute('aria-current', 'page')
  })
})

describe('GsPagination', () => {
  it('moves between pages', async () => {
    const page = ref(1)
    render(() =>
      h(GsPagination, {
        total: 12,
        modelValue: page.value,
        'onUpdate:modelValue': (v: number) => (page.value = v),
      }),
    )
    expect(screen.getByRole('navigation', { name: 'Page 1 of 12' })).toBeInTheDocument()
    expect(screen.getByRole('button', { name: 'Previous page' })).toBeDisabled()

    await userEvent.click(screen.getByRole('button', { name: 'Next page' }))
    expect(page.value).toBe(2)
    await userEvent.click(screen.getByRole('button', { name: 'Page 4' }))
    expect(page.value).toBe(4)
    expect(screen.getByRole('button', { name: 'Page 4' })).toHaveAttribute('aria-current', 'page')
  })
})

describe('GsStepper', () => {
  function setup(props: Record<string, unknown> = {}, disabled?: () => string | undefined) {
    const step = ref<GsStepValue>()
    const completed = ref<GsStepValue[]>([])
    render(() =>
      h(
        GsStepper,
        {
          modelValue: step.value,
          'onUpdate:modelValue': (v?: GsStepValue) => (step.value = v),
          completed: completed.value,
          'onUpdate:completed': (v: GsStepValue[]) => (completed.value = v),
          ...props,
        },
        () => [
          h(GsStepperList, { 'aria-label': 'Registration' }, () =>
            ['details', 'assets', 'review'].map((value) =>
              h(GsStepperStep, { value, disabled: disabled?.() === value }),
            ),
          ),
          h(GsStepperPanel, { value: 'details' }, () => 'Details form'),
          h(GsStepperPanel, { value: 'assets' }, () => 'Assets form'),
          h(GsStepperPanel, { value: 'review' }, () => 'Review form'),
          h(GsStepperBack),
          h(GsStepperNext),
        ],
      ),
    )
    return { step, completed }
  }

  const next = () => screen.getByRole('button', { name: 'Go to next step' })
  const back = () => screen.getByRole('button', { name: 'Go to previous step' })

  it('starts on the first step, or default-step, and names unlabeled steps', async () => {
    const { step } = setup({ defaultStep: 'assets' })
    await waitFor(() => expect(step.value).toBe('assets'))
    expect(screen.getByText('Assets form')).toBeInTheDocument()
    const current = screen.getByRole('button', { name: 'Step 2 of 3' })
    expect(current).toHaveAttribute('aria-current', 'step')
    expect(current).toHaveAttribute('data-current')
    expect(screen.getByRole('navigation', { name: 'Registration' })).toBeInTheDocument()
  })

  it('moves with Next and Back and tracks visited steps', async () => {
    const { step, completed } = setup()
    await waitFor(() => expect(step.value).toBe('details'))
    expect(back()).toBeDisabled()

    await userEvent.click(next())
    await userEvent.click(next())
    expect(step.value).toBe('review')
    expect(completed.value).toEqual(['details', 'assets'])
    expect(next()).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Step 1 of 3' })).toHaveAttribute('data-visited')

    // Going back clears visited state from the step you return to onwards.
    await userEvent.click(screen.getByRole('button', { name: 'Step 1 of 3' }))
    expect(step.value).toBe('details')
    expect(completed.value).toEqual([])
  })

  it('lets beforeStepChange block a move', async () => {
    const guard = vi.fn(() => false)
    const { step } = setup({ beforeStepChange: guard })
    await waitFor(() => expect(step.value).toBe('details'))
    await userEvent.click(next())
    expect(guard).toHaveBeenCalledWith('details', 'assets')
    expect(step.value).toBe('details')
  })

  it("doesn't move onto a disabled step", async () => {
    const disabled = ref<string>('details')
    const { step } = setup({ defaultStep: 'assets' }, () => disabled.value)
    await waitFor(() => expect(step.value).toBe('assets'))
    expect(back()).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Step 1 of 3' })).toBeDisabled()

    // The registry follows prop changes.
    disabled.value = 'review'
    await nextTick()
    expect(back()).toBeEnabled()
    expect(next()).toBeDisabled()
  })

  it('also disables steps listed in disabled-values', async () => {
    const { step } = setup({ disabledValues: ['assets'] })
    await waitFor(() => expect(step.value).toBe('details'))
    expect(next()).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Step 2 of 3' })).toHaveAttribute('data-disabled')
  })
})

describe('GsNoticeList', () => {
  const { queue, clear } = useNotices()
  afterEach(() => clear())

  it('shows queued notices and dismisses them', async () => {
    render(GsNoticeList)
    queue({ message: 'Uplink restored', color: 'normal' })
    expect(await screen.findByText('Uplink restored')).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Dismiss' }))
    expect(useNotices().notices.value).toHaveLength(0)
  })

  it('names each list so several lists stay distinguishable', () => {
    render(() => [h(GsNoticeList), h(GsNoticeList, { id: 'map', label: 'Map notifications' })])
    expect(screen.getByRole('region', { name: 'Notifications (F8)' })).toBeInTheDocument()
    expect(screen.getByRole('region', { name: 'Map notifications (F8)' })).toBeInTheDocument()
  })

  it('routes targeted notices and respects the limit', async () => {
    render(() => [h(GsNoticeList, { limit: 1 }), h(GsNoticeList, { id: 'panel' })])
    queue({ message: 'Global one' })
    queue({ message: 'Global two' })
    queue({ message: 'For the panel', target: 'panel' })
    await nextTick()
    // Like the Design Toolkit, the newest notice shows; older ones wait out of view.
    expect(await screen.findByText('Global two')).toBeInTheDocument()
    expect(screen.queryByText('Global one')).toBeNull()
    expect(screen.getByText('For the panel')).toBeInTheDocument()
  })
})

describe('GsActionBar', () => {
  it('makes buttons icon buttons at its size', () => {
    render(GsActionBar, {
      props: { size: 'small' },
      attrs: { 'aria-label': 'Map tools' },
      slots: { default: () => h(GsButton, { 'aria-label': 'Zoom in' }, () => '+') },
    })
    const button = screen.getByRole('button', { name: 'Zoom in' })
    expect(button).toHaveClass('icon')
    expect(button).toHaveAttribute('data-size', 'small')
  })
})

describe('GsList', () => {
  it('selects rows into v-model', async () => {
    const selected = ref<unknown[]>([])
    render(() =>
      h(
        GsList,
        {
          'aria-label': 'Tracks',
          selectionMode: 'multiple',
          modelValue: selected.value,
          'onUpdate:modelValue': (v: unknown) => (selected.value = v as unknown[]),
        },
        () => [
          h(GsListItem, { value: 'a', label: 'RAVEN 21' }),
          h(GsListItem, { value: 'b', label: 'VIPER 11' }),
        ],
      ),
    )
    expect(screen.getByRole('grid', { name: 'Tracks' })).toBeInTheDocument()
    await userEvent.click(screen.getByRole('row', { name: 'VIPER 11' }))
    expect(selected.value).toEqual(['b'])
  })

  it('emits action when rows are not selectable', async () => {
    const onAction = vi.fn()
    render(GsList, {
      attrs: { 'aria-label': 'Tracks' },
      slots: { default: () => h(GsListItem, { value: 'a', label: 'RAVEN 21', onAction }) },
    })
    const row = screen.getByRole('row', { name: 'RAVEN 21' })
    await userEvent.click(row)
    row.focus()
    await userEvent.keyboard('{Enter}')
    expect(onAction).toHaveBeenCalledTimes(2)
  })

  it('keeps row actions out of selection and the tab order', async () => {
    const selected = ref<unknown[]>([])
    const onEdit = vi.fn()
    const row = (value: string, label: string) =>
      h(
        GsListItem,
        { value, label },
        {
          actions: () => h(GsButton, { 'aria-label': `Edit ${label}`, onClick: onEdit }, () => '…'),
        },
      )
    render(() =>
      h(
        GsList,
        {
          'aria-label': 'Tracks',
          selectionMode: 'multiple',
          modelValue: selected.value,
          'onUpdate:modelValue': (v: unknown) => (selected.value = v as unknown[]),
        },
        () => [row('a', 'RAVEN 21'), row('b', 'VIPER 11')],
      ),
    )
    // Rows are named by their text only, not by the controls in them.
    expect(screen.getByRole('row', { name: 'RAVEN 21' })).toBeInTheDocument()

    await userEvent.click(screen.getByRole('button', { name: 'Edit VIPER 11' }))
    expect(onEdit).toHaveBeenCalledOnce()
    expect(selected.value).toEqual([])

    // Only the row that holds focus lets Tab reach its controls.
    await waitFor(() => {
      expect(screen.getByRole('button', { name: 'Edit RAVEN 21' })).toHaveAttribute(
        'tabindex',
        '-1',
      )
      expect(screen.getByRole('button', { name: 'Edit VIPER 11' })).toHaveAttribute('tabindex', '0')
    })
  })
})
