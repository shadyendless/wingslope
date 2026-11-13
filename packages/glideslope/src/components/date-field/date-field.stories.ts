import { Time, parseDate, type DateValue } from '@internationalized/date'
import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref, shallowRef } from 'vue'
import GsColorPicker from '../color-picker/GsColorPicker.vue'
import GsDateField from './GsDateField.vue'
import GsTimeField from './GsTimeField.vue'

const meta = {
  title: 'Components/DateField',
  component: GsDateField,
  args: {
    label: 'Departure',
    description: 'Local date',
    size: 'medium',
    shortMonth: true,
    disabled: false,
    readonly: false,
    required: false,
    errorMessage: '',
  },
  argTypes: { size: { control: 'inline-radio', options: ['medium', 'small'] } },
  render: (args) => ({
    components: { GsDateField },
    setup: () => ({ args, value: shallowRef(parseDate('2026-11-13')) }),
    template: `
      <div class="flex flex-col gap-s">
        <GsDateField v-bind="args" v-model="value" />
        <span class="text-body-s fg-primary-muted">value: {{ value?.toString() ?? 'null' }}</span>
      </div>`,
  }),
} satisfies Meta<typeof GsDateField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Empty: Story = {
  render: (args) => ({
    components: { GsDateField },
    setup: () => ({ args, value: shallowRef<DateValue | null>(null) }),
    template: '<GsDateField v-bind="args" v-model="value" />',
  }),
}

export const TimeField: Story = {
  render: () => ({
    components: { GsTimeField },
    setup: () => ({
      eta: shallowRef<Time | null>(new Time(14, 30)),
      start: shallowRef<Time | null>(null),
    }),
    template: `
      <div class="flex flex-col gap-m">
        <GsTimeField v-model="eta" label="ETA" :hour-cycle="24" />
        <GsTimeField v-model="start" label="Start" granularity="second" :hour-cycle="12" />
      </div>`,
  }),
}

export const ColorPicker: Story = {
  render: () => ({
    components: { GsColorPicker },
    setup: () => ({
      color: ref<string | undefined>('#1484f4'),
      items: ['#1484f4', '#0e8f37', '#5b137a', '#edda0a', '#ffad38', [255, 0, 51, 255]],
    }),
    template: `
      <div class="flex flex-col gap-s">
        <GsColorPicker v-model="color" label="Track color" :items="items" allow-empty show-custom-picker />
        <span class="text-body-s fg-primary-muted">value: {{ color ?? 'none' }}</span>
      </div>`,
  }),
}
