import { render } from '@testing-library/vue'
import { designTokens, type ThemeTokens } from '@wingbrace/glideslope-foundation/tokens'
import { afterEach, describe, expect, it } from 'vitest'
import { defineComponent, h, nextTick, ref } from 'vue'
import { provideTheme, useTheme, type DeepPartial, type Theme, type ThemeOptions } from './theme'

function setup(options?: ThemeOptions) {
  let provided!: Theme
  let injected!: Theme
  const Child = defineComponent({
    setup() {
      injected = useTheme()
      return () => null
    },
  })
  render(
    defineComponent({
      setup() {
        provided = provideTheme(options)
        return () => h(Child)
      },
    }),
  )
  return { provided, injected }
}

afterEach(() => {
  document.documentElement.className = ''
  document.documentElement.style.colorScheme = ''
})

describe('provideTheme / useTheme', () => {
  it('shares one theme with descendants and applies the mode to <html>', async () => {
    const { provided, injected } = setup({ defaultMode: 'light' })
    expect(injected).toBe(provided)
    await nextTick()
    expect(document.documentElement).toHaveClass('light')
    expect(document.documentElement.style.colorScheme).toBe('light')
  })

  it('switches mode and tokens', async () => {
    const { injected } = setup()
    expect(injected.mode.value).toBe('dark')
    expect(injected.tokens.value.bg.surface.default).toEqual(designTokens.dark.bg.surface.default)

    injected.toggleMode()
    await nextTick()
    expect(injected.mode.value).toBe('light')
    expect(document.documentElement).toHaveClass('light')
    expect(document.documentElement).not.toHaveClass('dark')
    expect(injected.tokens.value.bg.surface.default).toEqual(designTokens.light.bg.surface.default)
  })

  it('includes domain colors alongside semantic colors', () => {
    const { injected } = setup()
    expect(injected.tokens.value.classification.secret).toEqual(
      designTokens.domain.classification.secret,
    )
  })

  it('deep-merges reactive overrides without mutating the source tokens', async () => {
    const original = designTokens.dark.bg.surface.default
    const overrides = ref<DeepPartial<ThemeTokens> | undefined>({
      dark: { bg: { surface: { default: [1, 2, 3, 255] } } },
    })
    const { injected } = setup({ overrides })

    expect(injected.tokens.value.bg.surface.default).toEqual([1, 2, 3, 255])
    expect(injected.tokens.value.bg.surface.raised).toEqual(designTokens.dark.bg.surface.raised)
    expect(designTokens.dark.bg.surface.default).toBe(original)

    overrides.value = undefined
    await nextTick()
    expect(injected.tokens.value.bg.surface.default).toEqual(original)
  })

  it('leaves the document alone when target is null', async () => {
    setup({ target: null, defaultMode: 'light' })
    await nextTick()
    expect(document.documentElement.className).toBe('')
  })

  it('falls back to the dark theme without a provider', () => {
    let theme!: Theme
    render(
      defineComponent({
        setup() {
          theme = useTheme()
          return () => null
        },
      }),
    )
    expect(theme.mode.value).toBe('dark')
    expect(() => theme.toggleMode()).not.toThrow()
    expect(theme.mode.value).toBe('dark')
  })
})
