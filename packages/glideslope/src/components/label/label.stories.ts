import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsLabel from './GsLabel.vue'

const meta = {
  title: 'Components/Label',
  component: GsLabel,
  args: { required: false, disabled: false },
  render: (args) => ({
    components: { GsLabel },
    setup: () => ({ args }),
    template: '<GsLabel v-bind="args">Callsign</GsLabel>',
  }),
} satisfies Meta<typeof GsLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Required: Story = { args: { required: true } }
export const Disabled: Story = { args: { disabled: true } }
