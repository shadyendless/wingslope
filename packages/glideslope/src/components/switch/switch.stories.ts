import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import GsSwitch from './GsSwitch.vue'
import { provideSwitchDefaults } from './defaults'

const meta = {
  title: 'Components/Switch',
  component: GsSwitch,
  args: {
    disabled: false,
    labelPosition: 'end',
  },
  argTypes: {
    labelPosition: { control: 'select', options: ['end', 'start'] },
  },
  parameters: {
    docs: {
      subtitle: 'Toggle control for binary on/off states',
    },
  },
} satisfies Meta<typeof GsSwitch>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsSwitch },
    setup: () => ({ args, on: ref(false) }),
    template: '<GsSwitch v-bind="args" v-model="on">Label</GsSwitch>',
  }),
}

/**
 * `provideSwitchDefaults()` sets defaults (here `label-position` and `disabled`) for every
 * `GsSwitch` below the calling component. A prop set on a switch still wins.
 */
export const Provider: Story = {
  args: { labelPosition: 'start' },
  render: (args) => ({
    components: { GsSwitch },
    setup() {
      provideSwitchDefaults(() => ({ labelPosition: args.labelPosition, disabled: args.disabled }))
      return { first: ref(false), second: ref(true) }
    },
    template: `
      <div class="flex flex-col items-start gap-s">
        <GsSwitch v-model="first">Option 1</GsSwitch>
        <GsSwitch v-model="second">Option 2</GsSwitch>
      </div>`,
  }),
}
