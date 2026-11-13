import { render, screen, waitFor } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { defineComponent, h, ref, type VNodeChild } from 'vue'
import { provideTabDefaults, provideTabsDefaults } from './defaults'
import GsTab from './GsTab.vue'
import GsTabList from './GsTabList.vue'
import GsTabPanel from './GsTabPanel.vue'
import GsTabs from './GsTabs.vue'
import type { GsTabDefaults, GsTabsDefaults } from './types'

const tabs = (props: Record<string, unknown> = {}, tabProps: Record<string, unknown> = {}) =>
  h(GsTabs, props, () => [
    h(GsTabList, { 'aria-label': 'Views' }, () => [
      h(GsTab, { value: 'details', ...tabProps }, () => 'Details'),
      h(GsTab, { value: 'history' }, () => 'History'),
    ]),
    h(GsTabPanel, { value: 'details' }, () => 'Details panel'),
    h(GsTabPanel, { value: 'history' }, () => 'History panel'),
  ])

/** Renders `content` below a component that provides tabs defaults. */
function withDefaults(
  content: () => VNodeChild,
  defaults: { tabs?: GsTabsDefaults; tab?: GsTabDefaults },
) {
  return defineComponent({
    setup() {
      if (defaults.tabs) provideTabsDefaults(defaults.tabs)
      if (defaults.tab) provideTabDefaults(defaults.tab)
      return content
    },
  })
}

const tab = (name: string) => screen.getByRole('tab', { name })

describe('GsTabs disabled', () => {
  it('disables every tab but keeps the selection and its panel', async () => {
    const selected = ref<string | number>()
    render(() =>
      tabs({
        disabled: true,
        modelValue: selected.value,
        'onUpdate:modelValue': (v: string | number) => (selected.value = v),
      }),
    )
    await waitFor(() => expect(selected.value).toBe('details'))
    expect(tab('Details')).toBeDisabled()
    expect(tab('History')).toBeDisabled()
    expect(await screen.findByRole('tabpanel')).toHaveTextContent('Details panel')

    await userEvent.click(tab('History'))
    expect(selected.value).toBe('details')
  })

  it('disables a tab whose own disabled is false', () => {
    render(() => tabs({ disabled: true, modelValue: 'details' }, { disabled: false }))
    expect(tab('Details')).toBeDisabled()
  })
})

describe('provideTabsDefaults', () => {
  it('sets orientation, alignment, flex and disabled for every GsTabs below', () => {
    render(
      withDefaults(() => tabs({ modelValue: 'details' }), {
        tabs: { orientation: 'vertical', align: 'center', flex: false, disabled: true },
      }),
    )
    expect(screen.getByRole('tablist')).toHaveAttribute('aria-orientation', 'vertical')
    expect(tab('Details')).toBeDisabled()
    expect(tab('Details')).toHaveClass('center')
    expect(tab('Details')).not.toHaveClass('flex')
  })

  it('loses to props set on GsTabs', () => {
    render(
      withDefaults(
        () => tabs({ modelValue: 'details', align: 'end', flex: true, disabled: false }),
        {
          tabs: { align: 'center', flex: false, disabled: true },
        },
      ),
    )
    expect(tab('Details')).toHaveClass('end', 'flex')
    expect(tab('Details')).toBeEnabled()
  })

  it('switches to manual activation', async () => {
    render(
      withDefaults(() => tabs({ modelValue: 'details' }), { tabs: { activationMode: 'manual' } }),
    )
    tab('Details').focus()
    await userEvent.keyboard('{ArrowRight}')
    expect(tab('History')).toHaveFocus()
    expect(screen.getByRole('tabpanel')).toHaveTextContent('Details panel')
    await userEvent.keyboard('{Enter}')
    expect(screen.getByRole('tabpanel')).toHaveTextContent('History panel')
  })

  it('defaults to start-aligned, flexing tabs', () => {
    render(() => tabs({ modelValue: 'details' }))
    expect(tab('Details')).toHaveClass('flex')
    expect(tab('Details')).not.toHaveClass('center')
    expect(tab('Details')).not.toHaveClass('end')
  })
})

describe('GsTab style', () => {
  it('takes align and flex from its own props over GsTabs', () => {
    render(() => tabs({ modelValue: 'details', align: 'center' }, { align: 'end', flex: false }))
    expect(tab('Details')).toHaveClass('end')
    expect(tab('Details')).not.toHaveClass('flex')
    expect(tab('History')).toHaveClass('center', 'flex')
  })

  it('takes defaults from a provideTabDefaults nearer than GsTabs', () => {
    render(() =>
      h(GsTabs, { modelValue: 'details', align: 'center' }, () => [
        h(GsTabList, { 'aria-label': 'Views' }, () => [
          h(
            withDefaults(() => h(GsTab, { value: 'details' }, () => 'Details'), {
              tab: { align: 'end', disabled: true },
            }),
          ),
          h(GsTab, { value: 'history' }, () => 'History'),
        ]),
      ]),
    )
    expect(tab('Details')).toHaveClass('end')
    expect(tab('Details')).toBeDisabled()
    expect(tab('History')).toHaveClass('center')
    expect(tab('History')).toBeEnabled()
  })
})
