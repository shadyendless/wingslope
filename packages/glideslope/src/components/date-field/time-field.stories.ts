import { parseTime, type Time } from '@internationalized/date'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { shallowRef } from 'vue'
import GsTimeField from './GsTimeField.vue'

const meta = {
  title: 'Components/TimeField',
  component: GsTimeField,
  args: {
    label: 'Label',
    description: 'Format: hh:mm:ssz',
    errorMessage: '',
    size: 'medium',
    disabled: false,
    invalid: false,
    required: true,
    readonly: false,
    granularity: 'second',
    hourCycle: 24,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
    granularity: {
      control: 'select',
      options: ['hour', 'minute', 'second'],
    },
    hourCycle: {
      control: 'select',
      options: [12, 24],
    },
  },
  parameters: {
    docs: {
      subtitle: 'Form input for entering and editing time values',
    },
  },
  render: (args) => ({
    components: { GsTimeField },
    setup: () => ({ args, value: shallowRef<Time | null>(parseTime('20:03')) }),
    template: '<GsTimeField v-bind="args" v-model="value" />',
  }),
} satisfies Meta<typeof GsTimeField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Readonly: Story = {
  args: { readonly: true },
}
