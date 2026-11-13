import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import GsCheckbox from './GsCheckbox.vue'
import GsCheckboxGroup from './GsCheckboxGroup.vue'

/**
 * `GsCheckboxGroup` wraps Reka UI's `CheckboxGroupRoot` and holds the checked values as an array
 * in `v-model`. It stacks its checkboxes vertically by default; set `orientation="horizontal"` to
 * lay them out in a row.
 */
const meta = {
  title: 'Components/CheckboxGroup',
  component: GsCheckboxGroup,
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
} satisfies Meta<typeof GsCheckboxGroup>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsCheckbox, GsCheckboxGroup },
    setup: () => ({ args, values: ref([]) }),
    template: `
      <GsCheckboxGroup v-bind="args" v-model="values">
        <GsCheckbox value="value1">Checkbox text</GsCheckbox>
        <GsCheckbox value="value2">Checkbox text</GsCheckbox>
        <GsCheckbox value="value3">Checkbox text</GsCheckbox>
        <GsCheckbox value="value4">Checkbox text</GsCheckbox>
      </GsCheckboxGroup>`,
  }),
}
