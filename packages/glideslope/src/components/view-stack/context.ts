import {
  computed,
  inject,
  onScopeDispose,
  provide,
  shallowRef,
  watch,
  type ComputedRef,
  type InjectionKey,
} from 'vue'
import { joinViewStack, leaveViewStack, type ViewStackInstance } from './use-view-stacks'

export interface ViewStackContext {
  /** Id of the surrounding stack. */
  id: ComputedRef<string>
  /** Views on the stack, oldest first. */
  stack: ComputedRef<readonly string[]>
  /** The view the stack shows, or `null`. */
  view: ComputedRef<string | null>
  /** Registers a view rendered in the stack; returns the function that unregisters it. */
  registerView: (view: string) => () => void
}

const key: InjectionKey<ViewStackContext> = Symbol('GsViewStack')

/**
 * Makes the calling component a view stack: joins the shared state for `id` and provides the
 * stack to its views and triggers. `GsViewStack` and `GsDrawer` (which is a view stack) use it.
 */
export function provideViewStack(
  id: () => string,
  defaultView: () => string | undefined,
): ViewStackContext {
  const instance: ViewStackInstance = { views: new Map(), defaultView }
  const record = shallowRef(joinViewStack(id(), instance))

  watch(id, (next, previous) => {
    leaveViewStack(previous, instance)
    record.value = joinViewStack(next, instance)
  })
  onScopeDispose(() => leaveViewStack(id(), instance))

  const stack = computed(() => record.value.stack.value)
  const context: ViewStackContext = {
    id: computed(id),
    stack,
    view: computed(() => stack.value.at(-1) ?? null),
    registerView: (view) => {
      instance.views.set(view, (instance.views.get(view) ?? 0) + 1)
      return () => {
        const count = (instance.views.get(view) ?? 1) - 1
        if (count) instance.views.set(view, count)
        else instance.views.delete(view)
      }
    },
  }
  provide(key, context)
  return context
}

export function injectViewStackContext(): ViewStackContext | undefined {
  return inject(key, undefined)
}

/**
 * Splits a trigger target into its action and id: `'back:stack-1'` → `['back', 'stack-1']`,
 * `'back'` → `['back', undefined]` (the surrounding stack), and anything else is a view to push:
 * `'details'` → `['push', 'details']`.
 */
export function parseTarget<A extends string>(
  target: string,
  actions: readonly A[],
): [A | 'push', string | undefined] {
  const colon = target.indexOf(':')
  if (colon > 0) {
    const action = target.slice(0, colon) as A
    if (actions.includes(action)) return [action, target.slice(colon + 1)]
  }
  if ((actions as readonly string[]).includes(target)) return [target as A, undefined]
  return ['push', target]
}
