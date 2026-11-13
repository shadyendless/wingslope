import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsRadio from './GsRadio.vue'
import GsRadioGroup from './GsRadioGroup.vue'

const meta = {
  title: 'Components/Radio',
  component: GsRadio,
  decorators: [
    () => ({
      components: { GsRadioGroup },
      template: '<GsRadioGroup aria-label="Radio story"><story /></GsRadioGroup>',
    }),
  ],
  args: {
    value: 'radio',
    disabled: false,
    labelPosition: 'end',
  },
  argTypes: {
    labelPosition: { control: 'select', options: ['end', 'start'] },
  },
} satisfies Meta<typeof GsRadio>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsRadio },
    setup: () => ({ args }),
    template: '<GsRadio v-bind="args">Radio text</GsRadio>',
  }),
}
