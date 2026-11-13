import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
  title: 'Foundation/Elevation',
  tags: ['!autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface ElevationInfo {
  name: string
  shadow: string
}

const elevations: ElevationInfo[] = [
  {
    name: 'shadow-surface-overlay',
    shadow: 'shadow-elevation-overlay',
  },
  {
    name: 'shadow-surface-raised',
    shadow: 'shadow-elevation-raised',
  },
]

export const Elevation: Story = {
  render: () => ({
    setup: () => ({ elevations }),
    template: `
      <div class="flex flex-col gap-xl">
        <div class="flex flex-col gap-m">
          <h1 class="fg-primary-bold text-header-xl">Elevation</h1>
          <p class="fg-primary-muted text-body-s">
            These are the shadows that lift raised and overlay surfaces, such as cards, popovers
            and dialogs, above the page. Each one switches with the theme. Surfaces at the default
            elevation have no shadow.
            <br />
            <br />
            <strong>Note: </strong> The class name and Figma names are different to avoid color
            naming conflicts.
          </p>
        </div>
        <div class="flex flex-col gap-y-xxl">
          <div v-for="elevation in elevations" :key="elevation.name" class="flex items-center gap-l">
            <div :class="['size-90 bg-surface-overlay', elevation.shadow]" />
            <div class="fg-primary-bold flex flex-col gap-s font-display text-body-xs">
              <span>{{ elevation.shadow }}</span>
              <span class="fg-primary-muted">Figma: {{ elevation.name }}</span>
            </div>
          </div>
        </div>
      </div>`,
  }),
}
