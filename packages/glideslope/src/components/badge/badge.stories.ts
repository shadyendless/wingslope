import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { BellIcon } from '@wingbrace/glideslope-icons'
import GsIcon from '../icon/GsIcon.vue'
import GsBadge from './GsBadge.vue'

const meta = {
  title: 'Components/Badge',
  component: GsBadge,
  args: { color: 'info' },
  argTypes: {
    color: { control: 'select', options: ['info', 'advisory', 'normal', 'serious', 'critical'] },
    placement: {
      control: 'select',
      options: [
        undefined,
        'top',
        'bottom',
        'left',
        'right',
        'top left',
        'top right',
        'bottom left',
        'bottom right',
      ],
    },
    offset: { control: 'number' },
  },
  render: (args) => ({
    components: { GsBadge },
    setup: () => ({ args }),
    template: '<GsBadge v-bind="args">12</GsBadge>',
  }),
} satisfies Meta<typeof GsBadge>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Dot: Story = {
  render: (args) => ({
    components: { GsBadge },
    setup: () => ({ args }),
    template: '<GsBadge v-bind="args" />',
  }),
}

/** Placement pins the badge to the nearest positioned ancestor. */
export const Placement: Story = {
  args: { placement: 'top right', color: 'critical' },
  render: (args) => ({
    components: { GsBadge, GsIcon, BellIcon },
    setup: () => ({ args }),
    template: `
      <span class="relative inline-flex">
        <GsIcon size="large"><BellIcon /></GsIcon>
        <GsBadge v-bind="args" />
      </span>`,
  }),
}
