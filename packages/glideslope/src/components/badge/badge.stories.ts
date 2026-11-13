import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { BellIcon } from '@wingbrace/glideslope-icons'
import GsIcon from '../icon/GsIcon.vue'
import GsBadge from './GsBadge.vue'

const meta = {
  title: 'Components/Badge',
  component: GsBadge,
  args: { color: 'info' },
  argTypes: {
    color: { control: 'select', options: ['info', 'normal', 'serious', 'critical', 'advisory'] },
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
} satisfies Meta<typeof GsBadge>

export default meta
type Story = StoryObj<typeof meta>

/** Without content, a badge is a dot. */
export const Default: Story = {
  render: (args) => ({
    components: { GsBadge },
    setup: () => ({ args }),
    template: '<GsBadge v-bind="args" />',
  }),
}

export const WithText: Story = {
  render: (args) => ({
    components: { GsBadge },
    setup: () => ({ args }),
    template: '<GsBadge v-bind="args">99+</GsBadge>',
  }),
}

/** `placement` pins the badge to an edge or corner of its nearest positioned ancestor. */
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
