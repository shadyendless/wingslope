import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import GsRadio from './GsRadio.vue'
import GsRadioGroup from './GsRadioGroup.vue'

/**
 * `GsRadioGroup` wraps Reka UI's `RadioGroupRoot` and holds the selected value in `v-model`. It
 * stacks its radios vertically by default; set `orientation="horizontal"` to lay them out in a
 * row (this also switches arrow-key navigation to left and right).
 */
const meta = {
  title: 'Components/RadioGroup',
  component: GsRadioGroup,
  args: {
    label: 'Header',
    labelPosition: 'end',
    orientation: 'vertical',
    disabled: false,
    required: false,
  },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
  },
} satisfies Meta<typeof GsRadioGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsRadio, GsRadioGroup },
    setup: () => ({ args, value: ref<string>() }),
    template: `
      <GsRadioGroup v-bind="args" v-model="value">
        <GsRadio value="1">Radio text</GsRadio>
        <GsRadio value="2">Radio text</GsRadio>
        <GsRadio value="3">Radio text</GsRadio>
      </GsRadioGroup>`,
  }),
}
