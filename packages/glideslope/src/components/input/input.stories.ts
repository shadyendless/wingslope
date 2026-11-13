import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import GsInput from './GsInput.vue'

const meta = {
  title: 'Components/Input',
  component: GsInput,
  args: {
    size: 'medium',
    type: 'text',
    placeholder: 'Callsign',
    clearable: true,
    autoSize: false,
    disabled: false,
    readonly: false,
    invalid: false,
  },
  argTypes: {
    size: { control: 'inline-radio', options: ['medium', 'small'] },
    type: { control: 'select', options: ['text', 'number', 'email', 'password', 'date', 'time'] },
  },
  render: (args) => ({
    components: { GsInput },
    setup: () => ({ args, value: ref('') }),
    template: '<GsInput v-bind="args" v-model="value" aria-label="Callsign" />',
  }),
} satisfies Meta<typeof GsInput>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const PrefixAndSuffix: Story = {
  args: { type: 'number', placeholder: '0' },
  render: (args) => ({
    components: { GsInput },
    setup: () => ({ args, value: ref('24000') }),
    template: `
      <GsInput v-bind="args" v-model="value" aria-label="Altitude">
        <template #prefix>ALT</template>
        <template #suffix>ft</template>
      </GsInput>`,
  }),
}

/** The input grows with its value. */
export const AutoSize: Story = { args: { autoSize: true } }
