import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsStatusIndicator from './GsStatusIndicator.vue'

const statuses = ['good', 'degraded', 'poor', 'pending', 'unknown'] as const

const meta = {
  title: 'Components/StatusIndicator',
  component: GsStatusIndicator,
  args: { status: 'good' },
  argTypes: { status: { control: 'select', options: statuses } },
} satisfies Meta<typeof GsStatusIndicator>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const AllStatuses: Story = {
  render: () => ({
    components: { GsStatusIndicator },
    setup: () => ({ statuses }),
    template: `
      <div class="flex flex-col gap-s">
        <GsStatusIndicator v-for="status in statuses" :key="status" :status="status" :label="status" />
      </div>`,
  }),
}
