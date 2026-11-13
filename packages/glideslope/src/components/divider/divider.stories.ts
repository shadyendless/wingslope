import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsDivider from './GsDivider.vue'
import { provideDividerDefaults } from './defaults'

const meta = {
  title: 'Components/Divider',
  component: GsDivider,
  args: {
    orientation: 'horizontal',
  },
  argTypes: {
    orientation: {
      control: 'select',
      options: ['horizontal', 'vertical'],
    },
  },
} satisfies Meta<typeof GsDivider>

export default meta
type Story = StoryObj<typeof meta>

/** In a block container with a definite size, the divider fills its width or height. */
export const Default: Story = {
  render: (args) => ({
    components: { GsDivider },
    setup: () => ({ args }),
    template: `
      <div class="size-[200px]">
        <GsDivider v-bind="args" />
      </div>`,
  }),
}

export const Horizontal: Story = {
  args: {
    orientation: 'horizontal',
  },
  render: (args) => ({
    components: { GsDivider },
    setup: () => ({ args }),
    template: `
      <div class="fg-primary-bold">
        <div>Content above</div>
        <GsDivider v-bind="args" />
        <div>Content below</div>
      </div>`,
  }),
}

/** In a flex row, a vertical divider stretches to the row height. */
export const Vertical: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => ({
    components: { GsDivider },
    setup: () => ({ args }),
    template: `
      <div class="fg-primary-bold flex gap-s p-s">
        <div>Content left</div>
        <GsDivider v-bind="args" />
        <div>Content right</div>
      </div>`,
  }),
}

/** `provideDividerDefaults()` sets the orientation of every divider below the calling component. */
export const Provider: Story = {
  args: {
    orientation: 'vertical',
  },
  render: (args) => ({
    components: { GsDivider },
    setup: () => {
      provideDividerDefaults(() => ({ orientation: args.orientation }))
      return { args }
    },
    template: `
      <div class="fg-primary-bold flex gap-s p-s">
        <div>One</div>
        <GsDivider />
        <div>Two</div>
        <GsDivider />
        <div>Three</div>
      </div>`,
  }),
}
