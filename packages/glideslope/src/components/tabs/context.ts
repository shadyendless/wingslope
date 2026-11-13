import {
  computed,
  inject,
  onBeforeUnmount,
  provide,
  reactive,
  type ComputedRef,
  type InjectionKey,
} from 'vue'

/** @internal State `GsTabs` shares with its tabs. */
interface TabsContext {
  /** The whole set of tabs is disabled. */
  disabled: ComputedRef<boolean>
}

const key: InjectionKey<TabsContext> = Symbol('GsTabs')

export function provideTabsContext(context: TabsContext) {
  provide(key, context)
}

export function injectTabsContext(): TabsContext {
  return inject(key, { disabled: computed(() => false) })
}

/** @internal A registered `GsTab`, in render order. */
interface RegisteredTab {
  value: () => string | number
  /** The tab's own disabled state, not the whole set's. */
  disabled: () => boolean
}

const registryKey: InjectionKey<RegisteredTab[]> = Symbol('GsTabsRegistry')

/** Lets `GsTabs` find its first enabled tab, to select it when nothing is selected. */
export function provideTabRegistry(): RegisteredTab[] {
  const tabs = reactive<RegisteredTab[]>([])
  provide(registryKey, tabs)
  return tabs
}

export function useRegisterTab(tab: RegisteredTab) {
  const tabs = inject(registryKey, undefined)
  if (!tabs) return
  tabs.push(tab)
  onBeforeUnmount(() => {
    const index = tabs.indexOf(tab)
    if (index !== -1) tabs.splice(index, 1)
  })
}
