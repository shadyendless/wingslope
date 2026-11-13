import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsLabel from './GsLabel.vue'
import { provideLabelDefaults } from './defaults'

const meta = {
  title: 'Components/Label',
  component: GsLabel,
  args: {
    disabled: false,
    required: false,
  },
} satisfies Meta<typeof GsLabel>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsLabel },
    setup: () => ({ args }),
    template: '<GsLabel v-bind="args">Label</GsLabel>',
  }),
}

/** `provideLabelDefaults()` sets `required` and `disabled` for every label outside a field. */
export const Provider: Story = {
  args: {
    required: true,
  },
  render: (args) => ({
    components: { GsLabel },
    setup: () => {
      provideLabelDefaults(() => ({ required: args.required, disabled: args.disabled }))
      return { args }
    },
    template: `
      <div class="flex flex-col gap-s">
        <GsLabel>First name</GsLabel>
        <GsLabel>Last name</GsLabel>
        <GsLabel>Email</GsLabel>
      </div>`,
  }),
}
