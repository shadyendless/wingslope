import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import GsInput from './GsInput.vue'

const meta = {
  title: 'Components/Input',
  component: GsInput,
  args: {
    autoSize: false,
    disabled: false,
    placeholder: 'Placeholder',
    size: 'medium',
    clearable: true,
    invalid: false,
    readonly: false,
  },
  argTypes: {
    size: { control: 'select', options: ['medium', 'small'] },
  },
} satisfies Meta<typeof GsInput>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsInput },
    setup: () => ({ args, value: ref('') }),
    template: '<GsInput v-bind="args" v-model="value" aria-label="Input" />',
  }),
}

export const WithPrefix: Story = {
  args: { placeholder: '0.00', type: 'number' },
  render: (args) => ({
    components: { GsInput },
    setup: () => ({ args, value: ref('') }),
    template: `
      <GsInput v-bind="args" v-model="value" aria-label="Price">
        <template #prefix>$</template>
      </GsInput>`,
  }),
}

export const WithSuffix: Story = {
  args: { placeholder: '0', type: 'number' },
  render: (args) => ({
    components: { GsInput },
    setup: () => ({ args, value: ref('') }),
    template: `
      <GsInput v-bind="args" v-model="value" aria-label="Weight">
        <template #suffix>kg</template>
      </GsInput>`,
  }),
}

export const WithPrefixAndSuffix: Story = {
  args: { placeholder: '0', type: 'number' },
  render: (args) => ({
    components: { GsInput },
    setup: () => ({ args, value: ref('') }),
    template: `
      <GsInput v-bind="args" v-model="value" aria-label="Temperature">
        <template #prefix>~</template>
        <template #suffix>°C</template>
      </GsInput>`,
  }),
}
