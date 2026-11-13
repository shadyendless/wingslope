import { designTokens } from '@wingbrace/glideslope-foundation/tokens'
import type {
  DomainColorTokens,
  SemanticColorTokens,
  ThemeTokens,
} from '@wingbrace/glideslope-foundation/tokens'
import {
  computed,
  inject,
  provide,
  readonly,
  ref,
  toValue,
  watchEffect,
  type ComputedRef,
  type DeepReadonly,
  type InjectionKey,
  type MaybeRefOrGetter,
  type Ref,
} from 'vue'

export type ThemeMode = 'dark' | 'light'

/** Color tokens for the active mode (deck.gl RGBA tuples), plus domain colors. */
export type ThemeColorTokens = SemanticColorTokens & DomainColorTokens

export type DeepPartial<T> = {
  [K in keyof T]?: T[K] extends readonly unknown[]
    ? T[K]
    : T[K] extends object
      ? DeepPartial<T[K]>
      : T[K]
}

export interface ThemeOptions {
  /** Initial mode. @default 'dark' */
  defaultMode?: ThemeMode
  /** Token overrides, deep-merged over the Glideslope tokens. Can be reactive. */
  overrides?: MaybeRefOrGetter<DeepPartial<ThemeTokens> | undefined>
  /**
   * Element whose `dark` / `light` class and `color-scheme` follow the mode. Pass `null` to manage
   * the class yourself. @default document.documentElement
   */
  target?: HTMLElement | null
}

export interface Theme {
  /** The active mode. */
  mode: DeepReadonly<Ref<ThemeMode>>
  /** Color tokens for the active mode. Use these for canvas/WebGL rendering such as deck.gl. */
  tokens: ComputedRef<ThemeColorTokens>
  setMode: (mode: ThemeMode) => void
  toggleMode: () => void
}

const key: InjectionKey<Theme> = Symbol('GsTheme')

function isPlainObject(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value)
}

function deepMerge<T>(base: T, overrides: unknown): T {
  if (!isPlainObject(base) || !isPlainObject(overrides)) return (overrides ?? base) as T
  const result: Record<string, unknown> = { ...base }
  for (const [k, v] of Object.entries(overrides)) {
    if (v !== undefined) result[k] = deepMerge(result[k], v)
  }
  return result as T
}

function colorTokensFor(tokens: ThemeTokens, mode: ThemeMode): ThemeColorTokens {
  return { ...tokens[mode], ...tokens.domain }
}

/** Value returned by `useTheme()` when no ancestor called `provideTheme()`. */
const fallbackTheme: Theme = {
  mode: readonly(ref<ThemeMode>('dark')),
  tokens: computed(() => colorTokensFor(designTokens, 'dark')),
  setMode: () => {},
  toggleMode: () => {},
}

/**
 * Creates the theme state and provides it to descendants. Call once near the root of the app, for
 * example in `App.vue`.
 *
 * The mode is applied as a `dark` / `light` class and `color-scheme` on `<html>`, which drives
 * every Glideslope color through CSS `light-dark()`.
 *
 * @example
 * ```ts
 * // App.vue
 * const theme = provideTheme({ defaultMode: 'dark' })
 * ```
 */
export function provideTheme(options: ThemeOptions = {}): Theme {
  const mode = ref<ThemeMode>(options.defaultMode ?? 'dark')

  const tokens = computed(() =>
    colorTokensFor(deepMerge(designTokens, toValue(options.overrides)), mode.value),
  )

  watchEffect(() => {
    const target =
      options.target === undefined
        ? typeof document === 'undefined'
          ? null
          : document.documentElement
        : options.target
    if (!target) return
    target.classList.remove('dark', 'light')
    target.classList.add(mode.value)
    target.style.colorScheme = mode.value
  })

  const theme: Theme = {
    mode: readonly(mode),
    tokens,
    setMode: (next) => {
      mode.value = next
    },
    toggleMode: () => {
      mode.value = mode.value === 'dark' ? 'light' : 'dark'
    },
  }

  provide(key, theme)
  return theme
}

/**
 * Reads the theme provided by `provideTheme()`. Without a provider it returns the dark theme and
 * no-op setters, so components never need null checks.
 */
export function useTheme(): Theme {
  return inject(key, fallbackTheme)
}
