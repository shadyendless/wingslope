import { parseAbsoluteToLocal, parseDateTime, type DateValue } from '@internationalized/date'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { shallowRef } from 'vue'
import GsDateField from './GsDateField.vue'

const meta = {
  title: 'Components/DateField',
  component: GsDateField,
  args: {
    label: 'Label',
    description: 'Format: MMM dd yyyy',
    errorMessage: '',
    granularity: 'day',
    size: 'medium',
    disabled: false,
    invalid: false,
    required: true,
    readonly: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium'],
    },
    granularity: {
      control: 'select',
      options: ['day', 'hour', 'minute', 'second'],
    },
  },
} satisfies Meta<typeof GsDateField>

export default meta
type Story = StoryObj<typeof meta>

/** Renders the field with `v-model` bound to a ref that starts at `initial()`. */
const withValue =
  (initial: () => DateValue | null): Story['render'] =>
  (args) => ({
    components: { GsDateField },
    setup: () => ({ args, value: shallowRef(initial()) }),
    template: '<GsDateField v-bind="args" v-model="value" />',
  })

export const Default: Story = {
  render: withValue(() => parseDateTime('2020-01-23T00:00:00')),
}

export const WithoutShortMonth: Story = {
  args: {
    granularity: 'day',
    shortMonth: false,
    description: 'Format: mm dd yyyy',
  },
  render: withValue(() => parseDateTime('2020-01-23T00:00:00')),
}

export const DateTime: Story = {
  args: {
    granularity: 'second',
    description: 'Format: MMM dd yyyy hh:mm:ss a ZZZZ',
  },
  render: withValue(() => parseAbsoluteToLocal('2021-04-07T18:45:22Z')),
}

export const Readonly: Story = {
  args: {
    granularity: 'second',
    description: 'Format: MMM dd yyyy hh:mm:ss a ZZZZ',
    readonly: true,
  },
  render: withValue(() => parseAbsoluteToLocal('2021-04-07T18:45:22Z')),
}

/** Glideslope extra: `v-model` bound to `null` starts the field empty, showing placeholders. */
export const Empty: Story = {
  render: (args) => ({
    components: { GsDateField },
    setup: () => ({ args, value: shallowRef<DateValue | null>(null) }),
    template: `
      <div class="flex flex-col gap-s">
        <GsDateField v-bind="args" v-model="value" />
        <span class="text-body-s fg-primary-muted">value: {{ value?.toString() ?? 'null' }}</span>
      </div>`,
  }),
}
