import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
  title: 'Foundation/Radius',
  tags: ['!autodocs'],
  // The values are shown in `fg-disabled`, as in the design files.
  parameters: { a11y: { test: 'off' } },
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

const radiiVariants: string[] = ['none', 'small', 'medium', 'large', 'round']

export const Radius: Story = {
  render: () => ({
    setup: () => {
      const { documentElement } = document
      return {
        radii: radiiVariants.map((radiusVariant) => ({
          radiusClassName: `rounded-${radiusVariant}`,
          radiusPropertyValue: getComputedStyle(documentElement)
            .getPropertyValue(`--radius-${radiusVariant}`)
            .trim(),
          radiusVariable: `var(--radius-${radiusVariant})`,
        })),
      }
    },
    template: `
      <div class="flex flex-col gap-xl">
        <div class="flex flex-col gap-m">
          <h1 class="fg-primary-bold text-header-xl">Radius</h1>
          <p class="fg-primary-muted text-body-s">
            These are the corner radius values available for use in any Figma design file. They
            can be applied to components/elements with the rounded-[size] utility classes.
          </p>
        </div>
        <div class="flex flex-col gap-y-xxl">
          <div
            v-for="radius in radii"
            :key="radius.radiusClassName"
            class="flex items-center gap-l"
          >
            <div
              class="block h-40 w-80 outline outline-interactive-hover"
              :style="{ borderRadius: radius.radiusVariable }"
            />
            <div class="fg-primary-bold flex flex-col gap-s font-display text-body-xs">
              <span class="inline-flex gap-s">
                {{ radius.radiusClassName }}
                <span class="fg-disabled text-body-xxs">({{ radius.radiusPropertyValue }})</span>
              </span>
              <span class="fg-primary-muted">Figma: {{ radius.radiusClassName }}</span>
            </div>
          </div>
        </div>
      </div>`,
  }),
}
