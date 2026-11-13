import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { designTokens } from '@wingbrace/glideslope-foundation/tokens'

/** Flattens a token tree into `prefix-a-b` names, dropping a trailing `-base`. */
function tokenNames(tree: object, prefix: string): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const name = key === 'base' ? prefix : `${prefix}-${key}`
    return Array.isArray(value) || typeof value !== 'object'
      ? [name]
      : tokenNames(value as object, name)
  })
}

const colorGroups = (['bg', 'fg', 'outline'] as const).map((group) => ({
  group,
  names: tokenNames(designTokens.dark[group], group),
}))

const typography = (['header', 'body', 'button'] as const).flatMap((family) =>
  Object.keys(designTokens.typography.size[family]).map((size) => `${family}-${size}`),
)

const spacing = Object.entries(designTokens.spacing).filter(
  ([, v]) => typeof v === 'number' && v > 1,
)
const radius = Object.keys(designTokens.radius)

const meta = {
  title: 'Foundation/Tokens',
  parameters: { layout: 'padded', controls: { disable: true }, a11y: { test: 'off' } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

/** Semantic colors. Each switches between light and dark with the theme toolbar. */
export const Colors: Story = {
  render: () => ({
    setup: () => ({ colorGroups }),
    template: `
      <div class="flex flex-col gap-xl fg-primary-bold">
        <section v-for="{ group, names } in colorGroups" :key="group">
          <h2 class="text-header-l mb-m">{{ group }}-*</h2>
          <ul class="grid gap-s" style="grid-template-columns: repeat(auto-fill, minmax(220px, 1fr))">
            <li v-for="name in names" :key="name" class="flex items-center gap-s">
              <span
                class="size-xl rounded-medium outline outline-static shrink-0"
                :style="{ background: 'var(--' + name + ')' }"
              />
              <code class="text-body-xs">{{ name }}</code>
            </li>
          </ul>
        </section>
      </div>`,
  }),
}

export const Typography: Story = {
  render: () => ({
    setup: () => ({ typography }),
    template: `
      <ul class="flex flex-col gap-m fg-primary-bold">
        <li v-for="name in typography" :key="name" class="flex items-baseline gap-l">
          <code class="text-body-xs fg-primary-muted" style="width: 96px">text-{{ name }}</code>
          <span :class="'text-' + name">The quick brown fox jumps over the lazy dog</span>
        </li>
      </ul>`,
  }),
}

export const Spacing: Story = {
  render: () => ({
    setup: () => ({ spacing }),
    template: `
      <ul class="flex flex-col gap-s fg-primary-bold">
        <li v-for="[name, px] in spacing" :key="name" class="flex items-center gap-m">
          <code class="text-body-xs" style="width: 96px">{{ name }} ({{ px }}px)</code>
          <span class="bg-accent-primary-bold h-s" :style="{ width: 'var(--spacing-' + name + ')' }" />
        </li>
      </ul>`,
  }),
}

export const RadiusAndElevation: Story = {
  render: () => ({
    setup: () => ({ radius }),
    template: `
      <div class="flex flex-col gap-xl fg-primary-bold">
        <ul class="flex gap-l">
          <li v-for="name in radius" :key="name" class="flex flex-col items-center gap-xs">
            <span
              class="size-xxl bg-surface-raised outline outline-static"
              :style="{ borderRadius: 'var(--radius-' + name + ')' }"
            />
            <code class="text-body-xs">rounded-{{ name }}</code>
          </li>
        </ul>
        <ul class="flex gap-xl">
          <li class="flex flex-col items-center gap-xs">
            <span class="size-oversized bg-surface-raised rounded-large shadow-elevation-raised" />
            <code class="text-body-xs">shadow-elevation-raised</code>
          </li>
          <li class="flex flex-col items-center gap-xs">
            <span class="size-oversized bg-surface-overlay rounded-large shadow-elevation-overlay" />
            <code class="text-body-xs">shadow-elevation-overlay</code>
          </li>
        </ul>
      </div>`,
  }),
}
