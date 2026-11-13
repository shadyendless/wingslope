import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import GsButton from '../button/GsButton.vue'
import GsToggleButton from '../button/GsToggleButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsActionBar from './GsActionBar.vue'

const meta = {
  title: 'Components/ActionBar',
  component: GsActionBar,
  parameters: {
    layout: 'fullscreen',
  },
  args: {
    elevation: 'overlay',
    size: 'medium',
  },
  argTypes: {
    elevation: {
      control: 'select',
      options: ['flat', 'overlay', 'raised'],
    },
    size: {
      control: 'select',
      options: ['medium', 'small'],
    },
  },
} satisfies Meta<typeof GsActionBar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsActionBar, GsButton, GsIcon, PlaceholderIcon },
    setup: () => ({ args }),
    template: `
      <div class="relative h-[400px] bg-surface-overlay">
        <GsActionBar v-bind="args" aria-label="Actions" class="absolute top-s left-s">
          <GsButton v-for="n in 3" :key="n" :aria-label="\`Action \${n}\`">
            <GsIcon><PlaceholderIcon /></GsIcon>
          </GsButton>
        </GsActionBar>
      </div>`,
  }),
}

export const Toggle: Story = {
  render: (args) => ({
    components: { GsActionBar, GsToggleButton, GsIcon, PlaceholderIcon },
    setup: () => ({ args }),
    template: `
      <div class="relative h-[400px] bg-surface-overlay">
        <GsActionBar v-bind="args" aria-label="Actions" class="absolute top-s left-s">
          <GsToggleButton v-for="n in 3" :key="n" :aria-label="\`Toggle \${n}\`">
            <GsIcon><PlaceholderIcon /></GsIcon>
          </GsToggleButton>
        </GsActionBar>
      </div>`,
  }),
}
