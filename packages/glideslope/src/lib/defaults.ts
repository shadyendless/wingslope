import {
  computed,
  inject,
  provide,
  toValue,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
} from 'vue'

/**
 * Creates a typed provide/inject pair that lets a parent set default props for every matching
 * descendant component. This is how, for example, `GsButton` sizes the `GsIcon` inside it.
 *
 * Precedence is always: explicit prop > nearest provided default > the component's own default.
 * Nested providers replace (not merge with) outer ones.
 *
 * @example
 * ```ts
 * // In a parent component's <script setup>
 * provideButtonDefaults({ size: 'small', variant: 'flat' })
 * ```
 */
export function createDefaults<T extends object>(name: string) {
  const key: InjectionKey<MaybeRefOrGetter<Partial<T>>> = Symbol(`${name}Defaults`)
  const empty: Partial<T> = {}

  function provideDefaults(defaults: MaybeRefOrGetter<Partial<T>>): void {
    provide(key, defaults)
  }

  function injectDefaults(): ComputedRef<Partial<T>> {
    const defaults = inject(key, empty)
    return computed(() => toValue(defaults))
  }

  return [provideDefaults, injectDefaults] as const
}
