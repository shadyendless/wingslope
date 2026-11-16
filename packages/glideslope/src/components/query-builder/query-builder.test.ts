import type { RuleType } from '@react-querybuilder/vue'
import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it, vi } from 'vitest'
import { defineComponent, h, ref } from 'vue'
import { defaultQuery, fields } from './__fixtures__/example-configuration'
import GsQueryBuilder from './GsQueryBuilder.vue'
import type { Field, RuleGroupType } from './types'

/** Renders a query builder bound with `v-model:query`. */
function renderBuilder(
  props: Record<string, unknown> = {},
  initial: RuleGroupType = defaultQuery,
  slots: Record<string, unknown> = {},
) {
  const query = ref<RuleGroupType>(initial)
  const onUpdate = vi.fn((next: RuleGroupType) => (query.value = next))
  const result = render(() =>
    h(GsQueryBuilder, { fields, ...props, query: query.value, 'onUpdate:query': onUpdate }, slots),
  )
  return { query, onUpdate, ...result }
}

/** The rule at `index` of the root group. */
const rootRule = (query: RuleGroupType, index: number) => query.rules[index] as RuleType

const simpleQuery: RuleGroupType = {
  combinator: 'AND',
  rules: [
    { field: 'COUNTRY', operator: '=', value: 'Canada' },
    { field: 'AK_HIGH', operator: '>', value: '10' },
  ],
}

describe('GsQueryBuilder', () => {
  it('renders a form with a group and its rules', async () => {
    renderBuilder()

    expect(screen.getByRole('form')).toHaveClass('queryBuilder')
    expect(screen.getByRole('radiogroup', { name: 'Combinator' })).toBeInTheDocument()
    expect(screen.getAllByRole('combobox', { name: 'Field' })).toHaveLength(
      defaultQuery.rules.length,
    )
    await waitFor(() =>
      expect(screen.getAllByRole('combobox', { name: 'Operator' })[0]).toHaveValue('greater than'),
    )
    expect(screen.getByRole('spinbutton', { name: 'AK High' })).toHaveValue(10000)
  })

  it('updates the query bound with v-model:query', async () => {
    const { query } = renderBuilder({}, simpleQuery)
    const country = screen.getByRole('textbox', { name: 'Country' })

    await userEvent.clear(country)
    await userEvent.type(country, 'Peru')

    expect(rootRule(query.value, 0).value).toBe('Peru')
    expect(country).toHaveValue('Peru')
  })

  it('keeps its own query without v-model:query', async () => {
    render(GsQueryBuilder, { props: { fields, defaultQuery: simpleQuery } })

    await userEvent.click(screen.getByRole('button', { name: 'Add rule' }))

    expect(screen.getAllByRole('combobox', { name: 'Field' })).toHaveLength(3)
  })

  it('changes a rule field and operator from the comboboxes', async () => {
    const { query } = renderBuilder({}, simpleQuery)

    await userEvent.click(screen.getAllByRole('combobox', { name: 'Field' })[1]!)
    await userEvent.click(await screen.findByRole('option', { name: 'AK Low' }))
    expect(rootRule(query.value, 1).field).toBe('AK_LOW')

    await userEvent.click(screen.getAllByRole('combobox', { name: 'Operator' })[1]!)
    await userEvent.click(await screen.findByRole('option', { name: 'less than' }))
    expect(rootRule(query.value, 1).operator).toBe('<')
    await waitFor(() =>
      expect(screen.getAllByRole('combobox', { name: 'Operator' })[1]).toHaveValue('less than'),
    )
  })

  it('switches the combinator with its radio group', async () => {
    const { query } = renderBuilder({}, simpleQuery)
    const and = screen.getByRole('radio', { name: 'AND' })
    const or = screen.getByRole('radio', { name: 'OR' })
    expect(and).toHaveAttribute('data-state', 'checked')

    await userEvent.click(or)

    expect(query.value.combinator).toBe('OR')
    expect(or).toHaveAttribute('aria-checked', 'true')
    expect(or).toHaveAttribute('data-state', 'checked')
    expect(and).toHaveAttribute('data-state', 'unchecked')
  })

  it('checks the radio of a combinator given by name', () => {
    renderBuilder({}, { ...simpleQuery, combinator: 'or' })

    expect(screen.getByRole('radio', { name: 'OR' })).toHaveAttribute('aria-checked', 'true')
  })

  it('explains each combinator in a tooltip', async () => {
    renderBuilder({}, simpleQuery)

    screen.getByRole('radio', { name: 'OR' }).focus()

    expect(await screen.findByRole('tooltip')).toHaveTextContent(
      'One of the rules below must be true for a match',
    )
  })

  it('adds and removes rules and groups', async () => {
    const { query } = renderBuilder({}, simpleQuery)

    await userEvent.click(screen.getByRole('button', { name: 'Add rule' }))
    expect(query.value.rules).toHaveLength(3)

    await userEvent.click(screen.getAllByRole('button', { name: 'Remove rule' })[0]!)
    expect(query.value.rules).toHaveLength(2)
    expect(rootRule(query.value, 0).field).toBe('AK_HIGH')

    await userEvent.click(screen.getByRole('button', { name: 'Add group' }))
    expect(query.value.rules).toHaveLength(3)
    // The new group has its own combinator choice, add buttons and a remove button.
    expect(screen.getAllByRole('radiogroup', { name: 'Combinator' })).toHaveLength(2)
    expect(screen.getAllByRole('button', { name: 'Add rule' })).toHaveLength(2)

    await userEvent.click(screen.getByRole('button', { name: 'Remove group' }))
    expect(query.value.rules).toHaveLength(2)
  })

  it('shows clone buttons with show-clone-buttons, except on the root group', async () => {
    const { query } = renderBuilder({ showCloneButtons: true }, simpleQuery)
    expect(screen.queryByRole('button', { name: 'Clone group' })).not.toBeInTheDocument()

    await userEvent.click(screen.getAllByRole('button', { name: 'Clone rule' })[0]!)
    expect(query.value.rules).toHaveLength(3)
    expect(rootRule(query.value, 1).field).toBe('COUNTRY')

    await userEvent.click(screen.getByRole('button', { name: 'Add group' }))
    await userEvent.click(screen.getByRole('button', { name: 'Clone group' }))
    expect(query.value.rules).toHaveLength(5)
  })

  it('locks and unlocks a rule with show-lock-buttons', async () => {
    const { query } = renderBuilder({ showLockButtons: true }, simpleQuery)
    expect(screen.getAllByRole('button', { name: 'Lock rule' })).toHaveLength(2)

    await userEvent.click(screen.getAllByRole('button', { name: 'Lock rule' })[0]!)

    expect(rootRule(query.value, 0).disabled).toBe(true)
    expect(screen.getByRole('textbox', { name: 'Country' })).toBeDisabled()
    expect(screen.getAllByRole('button', { name: 'Remove rule' })[0]).toBeDisabled()
    const unlock = screen.getByRole('button', { name: 'Unlock rule' })
    expect(unlock).toBeEnabled()

    await userEvent.click(unlock)
    expect(rootRule(query.value, 0).disabled).toBe(false)
    expect(screen.getByRole('textbox', { name: 'Country' })).toBeEnabled()
  })

  it('locks a group and everything in it', async () => {
    const { query } = renderBuilder({ showLockButtons: true }, simpleQuery)

    await userEvent.click(screen.getByRole('button', { name: 'Lock group' }))

    expect(query.value.disabled).toBe(true)
    expect(screen.getByRole('button', { name: 'Unlock group' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Add rule' })).toBeDisabled()
    expect(screen.getByRole('radio', { name: 'OR' })).toBeDisabled()
    // A rule can't be unlocked while its group is locked.
    for (const button of screen.getAllByRole('button', { name: 'Lock rule' })) {
      expect(button).toBeDisabled()
    }
  })

  it('disables every control with disabled', () => {
    renderBuilder({ disabled: true }, simpleQuery)

    expect(screen.getByRole('textbox', { name: 'Country' })).toBeDisabled()
    expect(screen.getAllByRole('combobox', { name: 'Field' })[0]).toHaveAttribute(
      'aria-disabled',
      'true',
    )
    expect(screen.getByRole('button', { name: 'Add rule' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Add group' })).toBeDisabled()
    expect(screen.getAllByRole('button', { name: 'Remove rule' })[0]).toBeDisabled()
  })

  it('lays rules out by orientation', async () => {
    const view = render(GsQueryBuilder, { props: { fields, query: simpleQuery } })
    const rules = () => view.container.querySelectorAll('.rule')

    expect(rules()).toHaveLength(4) // two cells per rule
    for (const rule of rules()) expect(rule).toHaveClass('horizontal')

    await view.rerender({ fields, query: simpleQuery, orientation: 'vertical' })
    for (const rule of rules()) expect(rule).toHaveClass('vertical')
  })

  it('draws rule lines, ending at the last rule of each group', async () => {
    const view = render(GsQueryBuilder, { props: { fields, query: simpleQuery } })
    const lines = () => [...view.container.querySelectorAll('.lines')]

    expect(view.container.querySelector('.body')).toHaveClass('showRuleLines')
    expect(lines().map((line) => line.classList.contains('last'))).toEqual([false, true])
    expect(lines()[0]).toHaveAttribute('aria-hidden', 'true')

    await view.rerender({ fields, query: simpleQuery, showRuleLines: false })
    expect(lines()).toHaveLength(0)
    expect(view.container.querySelector('.body')).toHaveClass('hideRuleLines')
  })

  it('adds classes to its parts', () => {
    const { container } = renderBuilder(
      { classes: { queryBuilder: 'my-builder', rule: 'my-rule', fields: 'my-fields' } },
      simpleQuery,
    )

    expect(screen.getByRole('form')).toHaveClass('queryBuilder', 'my-builder')
    expect(container.querySelector('.rule')).toHaveClass('rule', 'horizontal', 'my-rule')
    expect(container.querySelector('.my-fields')).toHaveClass('control', 'fields')
  })

  it('passes orientation and show-rule-lines to the controls in their context', () => {
    const seen = vi.fn()
    const Probe = defineComponent({
      props: { context: { type: Object, default: undefined } },
      setup(props) {
        seen(props.context)
        return () => null
      },
    })
    renderBuilder(
      {
        context: { app: 'demo' },
        orientation: 'vertical',
        controlElements: { valueEditor: Probe },
      },
      simpleQuery,
    )

    expect(seen).toHaveBeenCalledWith({ app: 'demo', orientation: 'vertical', showRuleLines: true })
  })

  it('replaces controls with control-elements', () => {
    const Remove = defineComponent({
      props: { title: { type: String, default: '' } },
      setup: (props) => () => h('button', { type: 'button' }, `Custom ${props.title}`),
    })
    renderBuilder({ controlElements: { removeRuleAction: Remove } }, simpleQuery)

    expect(screen.getAllByRole('button', { name: 'Custom Remove rule' })).toHaveLength(2)
    expect(screen.queryByRole('button', { name: 'Remove rule' })).not.toBeInTheDocument()
  })

  it('replaces controls with scoped slots', async () => {
    const { query } = renderBuilder({}, simpleQuery, {
      addRuleAction: (props: { title: string; handleOnClick: (event: MouseEvent) => void }) =>
        h('button', { type: 'button', onClick: props.handleOnClick }, `Slot: ${props.title}`),
    })

    await userEvent.click(screen.getByRole('button', { name: 'Slot: Add rule' }))
    expect(query.value.rules).toHaveLength(3)
  })
})

describe('GsQueryBuilder value editors', () => {
  it('renders an editor for each value editor type', async () => {
    renderBuilder()

    expect(screen.getByRole('textbox', { name: 'Country' })).toHaveValue('Canada')
    expect(screen.getByRole('textbox', { name: 'Operator Notes' })).toHaveValue('Clear skies...')
    expect(screen.getByRole('checkbox', { name: 'Is Operational' })).toHaveAttribute(
      'aria-checked',
      'false',
    )
    expect(screen.getByRole('switch', { name: 'Has Donuts' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Service City' })).toHaveValue('Anchorage'),
    )

    const typeCode = screen.getByRole('radiogroup', { name: 'Type Code' })
    // The value list's placeholder isn't offered as a radio.
    expect(
      within(typeCode)
        .getAllByRole('radio')
        .map((radio) => radio.textContent),
    ).toEqual(['Heliport', 'Aerodrome', 'Unknown'])
    expect(within(typeCode).getByRole('radio', { name: 'Aerodrome' })).toHaveAttribute(
      'aria-checked',
      'true',
    )
  })

  it('updates checkbox, switch, radio and textarea values', async () => {
    const { query } = renderBuilder()
    const value = (field: string) =>
      query.value.rules.find((r) => 'field' in r && r.field === field)
    const valueOf = (field: string) => (value(field) as RuleType).value as unknown

    await userEvent.click(screen.getByRole('checkbox', { name: 'Is Operational' }))
    expect(valueOf('OPERSTATUS')).toBe(true)

    await userEvent.click(screen.getByRole('switch', { name: 'Has Donuts' }))
    expect(valueOf('DONUTS')).toBe(false)

    await userEvent.click(screen.getByRole('radio', { name: 'Heliport' }))
    expect(valueOf('TYPE_CODE')).toBe('Heliport')

    await userEvent.type(screen.getByRole('textbox', { name: 'Operator Notes' }), ' Windy.')
    expect(valueOf('NOTES')).toBe('Clear skies... Windy.')
  })

  it('renders a start and an end editor for range operators', async () => {
    const { query } = renderBuilder()

    expect(screen.getByRole('spinbutton', { name: 'AK Low start' })).toHaveValue(1000)
    const end = screen.getByRole('spinbutton', { name: 'AK Low end' })
    expect(end).toHaveValue(5000)
    expect(screen.getByLabelText('Established start')).toHaveValue('2024-10-01')
    expect(screen.getByLabelText('Peak Traffic end')).toHaveValue('19:22:54')

    await userEvent.clear(end)
    await userEvent.type(end, '7')

    expect(rootRule(query.value, 1).value).toEqual(['1000', '7'])
  })

  it('shows the validator reasons and marks the editor invalid', async () => {
    const { query } = renderBuilder({}, simpleQuery)
    const country = screen.getByRole('textbox', { name: 'Country' })
    expect(country).not.toHaveAttribute('aria-invalid', 'true')

    await userEvent.clear(country)

    expect(rootRule(query.value, 0).value).toBe('')
    expect(await screen.findByText('At least one character is required.')).toBeInTheDocument()
    expect(country).toHaveAttribute('aria-invalid', 'true')
  })

  it('validates each value of a range on its own', () => {
    renderBuilder(
      {},
      {
        combinator: 'AND',
        rules: [{ field: 'AK_LOW', operator: 'between', value: ['1', 'x'] }],
      },
    )

    expect(screen.getByRole('spinbutton', { name: 'AK Low start' })).not.toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getByRole('spinbutton', { name: 'AK Low end' })).toHaveAttribute(
      'aria-invalid',
      'true',
    )
    expect(screen.getAllByText('Number must be in range.')).toHaveLength(1)
  })

  it('renders no editor for the null operators', async () => {
    const nullable: Field[] = [{ name: 'CALLSIGN', label: 'Callsign' }]
    renderBuilder(
      { fields: nullable },
      {
        combinator: 'AND',
        rules: [{ field: 'CALLSIGN', operator: 'null', value: '' }],
      },
    )

    await waitFor(() =>
      expect(screen.getByRole('combobox', { name: 'Operator' })).toHaveValue('is null'),
    )
    expect(screen.queryByRole('textbox', { name: 'Callsign' })).not.toBeInTheDocument()
  })
})
