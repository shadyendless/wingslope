import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsClock from './GsClock.vue'

const meta = {
  title: 'Components/Clock',
  component: GsClock,
  args: {
    class: undefined,
    formatter: undefined,
  },
  argTypes: {
    class: {
      control: 'text',
    },
  },
  parameters: {
    controls: {
      exclude: ['formatter'],
    },
  },
} satisfies Meta<typeof GsClock>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsClock },
    setup: () => ({ args }),
    template: '<GsClock v-bind="args" />',
  }),
}

export const Styling: Story = {
  render: (args) => ({
    components: { GsClock },
    setup: () => ({ args }),
    template: '<GsClock v-bind="args" class="fg-accent-primary-bold" />',
  }),
}

const customFormatter = new Intl.DateTimeFormat('en-US', {
  dateStyle: 'short',
  timeStyle: 'long',
  timeZone: 'UTC',
  hour12: false,
})

export const CustomFormat: Story = {
  render: (args) => ({
    components: { GsClock },
    setup: () => ({ args, customFormatter }),
    template: '<GsClock v-bind="args" :formatter="customFormatter" />',
  }),
}
