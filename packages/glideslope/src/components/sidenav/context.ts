import { computed, inject, provide, type ComputedRef, type InjectionKey } from 'vue'

export interface SidenavContext {
  id: ComputedRef<string>
  open: ComputedRef<boolean>
}

/**
 * How `GsSidenavHeading` and `GsSidenavText` render where they are: the sidenav, an avatar, an item
 * and a menu each style them their own way.
 */
export interface SidenavPartsContext {
  heading: (string | undefined)[]
  text: (string | undefined)[]
  /** Inside a button or link, where a heading renders as plain text. */
  interactive: boolean
}

const sidenavKey: InjectionKey<SidenavContext> = Symbol('GsSidenav')
const partsKey: InjectionKey<ComputedRef<SidenavPartsContext>> = Symbol('GsSidenavParts')
const menuItemKey: InjectionKey<ComputedRef<string | undefined>> = Symbol('GsSidenavMenuItem')

export function provideSidenavContext(context: SidenavContext) {
  provide(sidenavKey, context)
}

export function injectSidenavContext(): SidenavContext | undefined {
  return inject(sidenavKey, undefined)
}

const noParts = computed<SidenavPartsContext>(() => ({
  heading: [],
  text: [],
  interactive: false,
}))

/** Overrides how the headings and text below render, keeping what isn't given from above. */
export function provideSidenavParts(parts: () => Partial<SidenavPartsContext>) {
  const outer = injectSidenavParts()
  provide(
    partsKey,
    computed(() => ({ ...outer.value, ...parts() })),
  )
}

export function injectSidenavParts(): ComputedRef<SidenavPartsContext> {
  return inject(partsKey, noParts)
}

/** The class menu items get: they look different in the expanded menu and the collapsed panel. */
export function provideSidenavMenuItemClass(itemClass: ComputedRef<string | undefined>) {
  provide(menuItemKey, itemClass)
}

export function injectSidenavMenuItemClass(): ComputedRef<string | undefined> | undefined {
  return inject(menuItemKey, undefined)
}
