import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref, watch } from 'vue'
import GsCheckbox from './GsCheckbox.vue'

const meta = {
  title: 'Components/Checkbox',
  component: GsCheckbox,
  args: {
    disabled: false,
    modelValue: false,
    labelPosition: 'end',
  },
  argTypes: {
    // There is no `indeterminate` prop: the model takes `'indeterminate'` as a third state.
    modelValue: { control: 'select', options: [false, true, 'indeterminate'] },
    labelPosition: { control: 'select', options: ['end', 'start'] },
  },
} satisfies Meta<typeof GsCheckbox>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsCheckbox },
    setup() {
      const checked = ref(args.modelValue)
      watch(
        () => args.modelValue,
        (next) => (checked.value = next),
      )
      return { args, checked }
    },
    template: '<GsCheckbox v-bind="args" v-model="checked">Unsubscribe</GsCheckbox>',
  }),
}
