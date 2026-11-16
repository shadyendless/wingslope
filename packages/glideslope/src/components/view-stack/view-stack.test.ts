import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vite-plus/test'
import { computed, h, nextTick, ref, type VNodeChild } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsViewStack from './GsViewStack.vue'
import GsViewStackTrigger from './GsViewStackTrigger.vue'
import GsViewStackView from './GsViewStackView.vue'
import type { GsViewStackTarget } from './types'
import { useViewStacks } from './use-view-stacks'

const ids = { stack: 'stack', a: 'view-a', b: 'view-b', c: 'view-c' }

const trigger = (target: GsViewStackTarget | GsViewStackTarget[], label: string) =>
  h(GsViewStackTrigger, { for: target }, () => h(GsButton, null, () => label))

const contents = () => [
  h(GsViewStackView, { id: ids.a }, () => 'A'),
  h(GsViewStackView, { id: ids.b }, () => 'B'),
  h(GsViewStackView, { id: ids.c }, () => 'C'),
  trigger(ids.a, 'Goto A'),
  trigger(ids.b, 'Goto B'),
  trigger(ids.c, 'Goto C'),
  trigger('back', 'Back'),
  trigger('clear', 'Clear'),
  trigger('reset', 'Reset'),
]

function setup(props: Record<string, unknown> = {}, outside: () => VNodeChild = () => null) {
  return render(() => [h(GsViewStack, { id: ids.stack, ...props }, contents), outside()])
}

const click = (name: string) => userEvent.click(screen.getByRole('button', { name }))
const shown = () => ['A', 'B', 'C'].filter((text) => screen.queryByText(text))

describe('GsViewStack', () => {
  it('renders nothing without a default view', () => {
    setup()
    expect(shown()).toEqual([])
  })

  it('renders the default view', () => {
    setup({ defaultView: ids.a })
    expect(shown()).toEqual(['A'])
  })

  it('navigates to a view', async () => {
    setup()
    await click('Goto A')
    expect(shown()).toEqual(['A'])
    await click('Goto B')
    expect(shown()).toEqual(['B'])
  })

  it('navigates back to the previous view, then to nothing', async () => {
    setup()
    await click('Goto A')
    await click('Goto B')
    await click('Back')
    expect(shown()).toEqual(['A'])
    await click('Back')
    expect(shown()).toEqual([])
  })

  it('navigates back to the default view and stays there', async () => {
    setup({ defaultView: ids.a })
    await click('Goto B')
    expect(shown()).toEqual(['B'])
    await click('Back')
    expect(shown()).toEqual(['A'])
    await click('Back')
    expect(shown()).toEqual(['A'])
  })

  it('clears the stack', async () => {
    setup({ defaultView: ids.a })
    await click('Goto B')
    await click('Goto C')
    expect(shown()).toEqual(['C'])
    await click('Clear')
    expect(shown()).toEqual([])
  })

  it('resets the stack to nothing without a default view', async () => {
    setup()
    await click('Goto A')
    await click('Reset')
    expect(shown()).toEqual([])
  })

  it('resets the stack to the default view', async () => {
    setup({ defaultView: ids.a })
    await click('Goto C')
    expect(shown()).toEqual(['C'])
    await click('Reset')
    expect(shown()).toEqual(['A'])
  })

  it('is triggerable from outside the stack by view and stack id', async () => {
    setup({}, () => [
      trigger(ids.c, 'Goto C from outside'),
      trigger(`clear:${ids.stack}`, 'Clear from outside'),
    ])
    await click('Goto C from outside')
    expect(shown()).toEqual(['C'])
    await click('Clear from outside')
    expect(shown()).toEqual([])
  })

  it('ignores untargeted commands outside a stack', async () => {
    setup({ defaultView: ids.a }, () => trigger('clear', 'Clear outside'))
    await click('Clear outside')
    expect(shown()).toEqual(['A'])
  })

  it('runs chained targets in order', async () => {
    setup({ defaultView: ids.a }, () => [
      trigger([`clear:${ids.stack}`, ids.b, ids.c], 'Hydrate'),
      trigger([`back:${ids.stack}`, `back:${ids.stack}`], 'Back twice'),
    ])
    await click('Hydrate')
    expect(shown()).toEqual(['C'])
    expect(useViewStacks().stack(ids.stack)).toEqual([ids.b, ids.c])
    await click('Back twice')
    expect(shown()).toEqual(['A'])
  })

  it('runs triggers from the keyboard', async () => {
    setup()
    screen.getByRole('button', { name: 'Goto B' }).focus()
    await userEvent.keyboard('{Enter}')
    expect(shown()).toEqual(['B'])
    screen.getByRole('button', { name: 'Back' }).focus()
    await userEvent.keyboard(' ')
    expect(shown()).toEqual([])
  })

  it('pushes a view only onto the stack that renders it', async () => {
    render(() => [
      h(GsViewStack, { id: 'one' }, () => h(GsViewStackView, { id: 'x' }, () => 'X')),
      h(GsViewStack, { id: 'two' }, () => h(GsViewStackView, { id: 'y' }, () => 'Y')),
    ])
    useViewStacks().push('y')
    await nextTick()
    expect(screen.queryByText('X')).toBeNull()
    expect(screen.getByText('Y')).toBeInTheDocument()
    expect(useViewStacks().stack('one')).toEqual([])
  })

  it('emits change with the shown view', async () => {
    const changes: (string | null)[] = []
    setup({ onChange: (view: string | null) => changes.push(view) })
    await click('Goto A')
    await click('Goto B')
    await click('Back')
    await click('Clear')
    expect(changes).toEqual([ids.a, ids.b, ids.a, null])
  })

  it('moves its state to a new id', async () => {
    const id = ref('first')
    render(() =>
      h(GsViewStack, { id: id.value, defaultView: ids.a }, () => [
        h(GsViewStackView, { id: ids.a }, () => 'A'),
        h(GsViewStackView, { id: ids.b }, () => 'B'),
      ]),
    )
    id.value = 'second'
    await nextTick()
    expect(useViewStacks().view('first')).toBeNull()
    useViewStacks().push(ids.b)
    await nextTick()
    expect(useViewStacks().stack('second')).toEqual([ids.a, ids.b])
    expect(shown()).toEqual(['B'])
  })

  it('drops its state when it unmounts', () => {
    const rendered = setup({ defaultView: ids.a })
    expect(useViewStacks().view(ids.stack)).toBe(ids.a)
    rendered.unmount()
    expect(useViewStacks().view(ids.stack)).toBeNull()
    expect(useViewStacks().stack(ids.stack)).toEqual([])
  })
})

describe('useViewStacks', () => {
  it('drives a stack by id and reads its state reactively', async () => {
    const { push, back, clear, reset, view, stack } = useViewStacks()
    const current = computed(() => view(ids.stack))
    const depth = computed(() => stack(ids.stack).length)
    setup({ defaultView: ids.a })
    expect(current.value).toBe(ids.a)

    push(ids.b)
    push(ids.c)
    await nextTick()
    expect(shown()).toEqual(['C'])
    expect(current.value).toBe(ids.c)
    expect(depth.value).toBe(3)

    back(ids.stack)
    await nextTick()
    expect(shown()).toEqual(['B'])

    clear(ids.stack)
    await nextTick()
    expect(current.value).toBeNull()

    reset(ids.stack)
    await nextTick()
    expect(shown()).toEqual(['A'])
  })

  it('ignores unknown stacks and views', () => {
    const { push, back, clear, reset, view, stack } = useViewStacks()
    expect(() => {
      push('nowhere')
      back('nowhere')
      clear('nowhere')
      reset('nowhere')
    }).not.toThrow()
    expect(view('nowhere')).toBeNull()
    expect(stack('nowhere')).toEqual([])
  })
})

describe('GsViewStackView', () => {
  it('throws outside a GsViewStack', () => {
    expect(() => render(GsViewStackView, { props: { id: ids.a } })).toThrow(
      'GsViewStackView must be used inside a GsViewStack',
    )
  })
})
