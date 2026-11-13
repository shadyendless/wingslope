import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
  title: 'Foundation/Spacing',
  tags: ['!autodocs'],
  // The values are shown in `fg-disabled`, as in the design files.
  parameters: { a11y: { test: 'off' } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface SpacingInfo {
  name: string
  size: string
}

const spacing: SpacingInfo[] = [
  {
    name: 'spacing/xxs',
    size: 'size-xxs',
  },
  {
    name: 'spacing/xs',
    size: 'size-xs',
  },
  {
    name: 'spacing/s',
    size: 'size-s',
  },
  {
    name: 'spacing/m',
    size: 'size-m',
  },
  {
    name: 'spacing/l',
    size: 'size-l',
  },
  {
    name: 'spacing/xl',
    size: 'size-xl',
  },
  {
    name: 'spacing/xxl',
    size: 'size-xxl',
  },
  {
    name: 'spacing/oversized',
    size: 'size-oversized',
  },
]

export const Spacing: Story = {
  render: () => ({
    setup: () => {
      const rootStyle = getComputedStyle(document.documentElement)
      return {
        spacing: spacing.map((space) => ({
          ...space,
          value: rootStyle.getPropertyValue(`--${space.name.replace('/', '-')}`).trim(),
        })),
      }
    },
    template: `
      <div class="flex flex-col gap-xl">
        <div class="flex flex-col gap-m">
          <h1 class="fg-primary-bold text-header-xl">Spacing</h1>
          <p class="fg-primary-muted text-body-s">
            These are the contextualized spacing values available for use in any Figma design
            file. It can be applied to components/elements as padding and/or gap for listing
            patterns.
            <br />
            <br />
            The following sizes can be used with utility classes such as:
            <span class="font-display">p-[size], m-[size], gap-[size], h-[size], w-[size]</span>
          </p>
        </div>
        <div class="grid grid-cols-2 gap-x-oversized gap-y-xxl">
          <div v-for="space in spacing" :key="space.name" class="flex items-center gap-l">
            <div :class="['bg-accent-primary-muted outline outline-accent-primary-bold', space.size]" />
            <div class="fg-primary-bold flex flex-col gap-s font-display text-body-xs">
              <span class="inline-flex gap-s">
                {{ space.size }}
                <span class="fg-disabled text-body-xxs">({{ space.value }})</span>
              </span>
              <span class="fg-primary-muted">Figma: {{ space.name }}</span>
            </div>
          </div>
        </div>
      </div>`,
  }),
}
