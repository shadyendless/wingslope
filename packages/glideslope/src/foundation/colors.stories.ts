import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { defineComponent, onBeforeUnmount, onMounted, ref, type PropType } from 'vue'

const meta = {
  title: 'Foundation/Colors',
  tags: ['!autodocs'],
  // Swatch pages show every token side by side, including deliberately low-contrast ones.
  parameters: { a11y: { test: 'off' } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/**
 * The semantic color tokens, by utility prefix. Each name is both a utility class and a CSS
 * variable (`bg-surface-default` → `--bg-surface-default`).
 */
const tokens = {
  bg: {
    base: [
      'bg-surface-default',
      'bg-surface-raised',
      'bg-surface-overlay',
      'bg-surface-muted',
      'bg-interactive-bold',
      'bg-interactive-bold-hover',
      'bg-interactive-bold-pressed',
      'bg-interactive-muted',
      'bg-interactive-muted-hover',
      'bg-interactive-muted-pressed',
      'bg-interactive-disabled',
      'bg-accent-primary-bold',
      'bg-accent-primary-hover',
      'bg-accent-primary-pressed',
      'bg-accent-primary-muted',
    ],
    utility: [
      'bg-info-bold',
      'bg-info-hover',
      'bg-info-pressed',
      'bg-info-muted',
      'bg-advisory-bold',
      'bg-advisory-hover',
      'bg-advisory-pressed',
      'bg-advisory-muted',
      'bg-normal-bold',
      'bg-normal-hover',
      'bg-normal-pressed',
      'bg-normal-muted',
      'bg-serious-bold',
      'bg-serious-hover',
      'bg-serious-pressed',
      'bg-serious-muted',
      'bg-critical-bold',
      'bg-critical-hover',
      'bg-critical-pressed',
      'bg-critical-muted',
    ],
  },
  fg: {
    base: [
      'fg-primary-bold',
      'fg-primary-muted',
      'fg-inverse-bold',
      'fg-inverse-muted',
      'fg-disabled',
      'fg-pressed',
      'fg-hover',
    ],
    utility: [
      'fg-accent-primary-bold',
      'fg-accent-primary-hover',
      'fg-accent-primary-pressed',
      'fg-info-bold',
      'fg-info-hover',
      'fg-info-pressed',
      'fg-advisory-bold',
      'fg-advisory-hover',
      'fg-advisory-pressed',
      'fg-normal-bold',
      'fg-normal-hover',
      'fg-normal-pressed',
      'fg-serious-bold',
      'fg-serious-hover',
      'fg-serious-pressed',
      'fg-critical-bold',
      'fg-critical-hover',
      'fg-critical-pressed',
    ],
    a11y: ['fg-a11y-on-accent', 'fg-a11y-on-utility'],
  },
  outline: {
    base: [
      'outline-static',
      'outline-interactive',
      'outline-interactive-hover',
      'outline-interactive-pressed',
      'outline-interactive-disabled',
      'outline-accent-primary-bold',
      'outline-accent-primary-hover',
      'outline-accent-primary-pressed',
    ],
    utility: [
      'outline-info-bold',
      'outline-info-hover',
      'outline-info-pressed',
      'outline-advisory-bold',
      'outline-advisory-hover',
      'outline-advisory-pressed',
      'outline-normal-bold',
      'outline-normal-hover',
      'outline-normal-pressed',
      'outline-mono-bold',
      'outline-mono-bold-hover',
      'outline-mono-bold-pressed',
      'outline-serious-bold',
      'outline-serious-hover',
      'outline-serious-pressed',
      'outline-critical-bold',
      'outline-critical-hover',
      'outline-critical-pressed',
    ],
  },
}

const hex = (channel: number) => Math.round(channel).toString(16).padStart(2, '0')

/** `rgb(1, 2, 3)` / `rgba(1, 2, 3, 0.5)` → `#010203` / `#01020380`. Anything else is returned as is. */
function toHex(color: string): string {
  const channels = /^rgba?\(([^)]+)\)$/
    .exec(color)?.[1]
    ?.split(/[\s,/]+/)
    .map(Number)
  if (!channels || channels.length < 3 || channels.some(Number.isNaN)) return color
  const [r = 0, g = 0, b = 0, a = 1] = channels
  return `#${hex(r)}${hex(g)}${hex(b)}${a < 1 ? hex(a * 255) : ''}`
}

/**
 * Resolves each token's color for the active theme. Semantic tokens are `light-dark()` pairs, so
 * the value is read from an element's computed color, and read again whenever the theme class or
 * `data-theme` on `<html>` changes.
 */
function useColorValues(utilityClassGroup: Record<string, string[]>) {
  const colorValues = ref(new Map<string, string>())
  let observer: MutationObserver | undefined

  const computeColorValues = () => {
    const probe = document.createElement('span')
    document.body.append(probe)
    const next = new Map<string, string>()
    for (const utilityClass of Object.values(utilityClassGroup).flat()) {
      probe.style.color = `var(--${utilityClass})`
      next.set(utilityClass, toHex(getComputedStyle(probe).color))
    }
    probe.remove()
    colorValues.value = next
  }

  onMounted(() => {
    computeColorValues()
    observer = new MutationObserver(computeColorValues)
    observer.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ['class', 'data-theme'],
    })
  })
  onBeforeUnmount(() => observer?.disconnect())

  return colorValues
}

const ColorDisplay = defineComponent({
  props: {
    type: { type: String as PropType<'swatch' | 'outline'>, required: true },
    utilityClass: { type: String, required: true },
    colorValue: { type: String, default: undefined },
  },
  template: `
    <div class="flex items-center gap-l">
      <div
        v-if="type === 'outline'"
        class="h-90 w-120 rounded-large outline"
        :style="{ outlineColor: 'var(--' + utilityClass + ')' }"
      />
      <div
        v-else
        class="h-90 w-120 rounded-large outline outline-static"
        :style="{ backgroundColor: 'var(--' + utilityClass + ')' }"
      />
      <div class="fg-primary-bold flex flex-col gap-s font-display text-body-xs">
        <span>{{ utilityClass }}</span>
        <span class="fg-primary-muted">{{ colorValue }}</span>
      </div>
    </div>`,
})

export const Background: Story = {
  render: () => ({
    components: { ColorDisplay },
    setup: () => ({ tokens, bgColorValues: useColorValues(tokens.bg) }),
    template: `
      <div class="flex flex-col gap-xl">
        <div class="flex flex-col gap-m">
          <h1 class="fg-primary-bold text-header-xl">Semantic Background</h1>
          <p class="fg-primary-muted text-body-s">
            These are tokens primarily used as backgrounds for any element or component that
            contains content such as containers, sections, headers, buttons, etc.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-x-l gap-y-xl">
          <ColorDisplay
            v-for="utilityClass in tokens.bg.base"
            :key="utilityClass"
            type="swatch"
            :utility-class="utilityClass"
            :color-value="bgColorValues.get(utilityClass)"
          />
        </div>
        <div class="mt-oversized grid grid-cols-4 gap-x-l gap-y-xl">
          <ColorDisplay
            v-for="utilityClass in tokens.bg.utility"
            :key="utilityClass"
            type="swatch"
            :utility-class="utilityClass"
            :color-value="bgColorValues.get(utilityClass)"
          />
        </div>
      </div>`,
  }),
}

export const Foreground: Story = {
  render: () => ({
    components: { ColorDisplay },
    setup: () => ({ tokens, fgColorValues: useColorValues(tokens.fg) }),
    template: `
      <div class="flex flex-col gap-xl">
        <div class="flex flex-col gap-m">
          <h1 class="fg-primary-bold text-header-xl">Semantic Foreground</h1>
          <p class="fg-primary-muted text-body-s">
            These are tokens primarily used as fill for elements like text, icons, vectors, and
            other things that sit above a background.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-x-l gap-y-xl">
          <ColorDisplay
            v-for="utilityClass in tokens.fg.base"
            :key="utilityClass"
            type="swatch"
            :utility-class="utilityClass"
            :color-value="fgColorValues.get(utilityClass)"
          />
        </div>
        <div class="mt-oversized grid grid-cols-3 gap-x-l gap-y-xl">
          <ColorDisplay
            v-for="utilityClass in tokens.fg.utility"
            :key="utilityClass"
            type="swatch"
            :utility-class="utilityClass"
            :color-value="fgColorValues.get(utilityClass)"
          />
        </div>
        <div class="mt-oversized grid grid-cols-3 gap-x-l gap-y-xl">
          <ColorDisplay
            v-for="utilityClass in tokens.fg.a11y"
            :key="utilityClass"
            type="swatch"
            :utility-class="utilityClass"
            :color-value="fgColorValues.get(utilityClass)"
          />
        </div>
      </div>`,
  }),
}

export const Outline: Story = {
  render: () => ({
    components: { ColorDisplay },
    setup: () => ({ tokens, outlineColorValues: useColorValues(tokens.outline) }),
    template: `
      <div class="flex flex-col gap-xl">
        <div class="flex flex-col gap-m">
          <h1 class="fg-primary-bold text-header-xl">Semantic Outline</h1>
          <p class="fg-primary-muted text-body-s">
            These are tokens primarily used as stroke colors for components and elements.
          </p>
        </div>
        <div class="grid grid-cols-2 gap-x-l gap-y-xl">
          <ColorDisplay
            v-for="utilityClass in tokens.outline.base"
            :key="utilityClass"
            type="outline"
            :utility-class="utilityClass"
            :color-value="outlineColorValues.get(utilityClass)"
          />
        </div>
        <div class="mt-oversized grid grid-cols-3 gap-x-l gap-y-xl">
          <ColorDisplay
            v-for="utilityClass in tokens.outline.utility"
            :key="utilityClass"
            type="outline"
            :utility-class="utilityClass"
            :color-value="outlineColorValues.get(utilityClass)"
          />
        </div>
      </div>`,
  }),
}
