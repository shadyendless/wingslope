import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsDivider from './GsDivider.vue'

const meta = {
  title: 'Components/Divider',
  component: GsDivider,
  args: { orientation: 'horizontal', decorative: false },
  argTypes: { orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] } },
} satisfies Meta<typeof GsDivider>

export default meta
type Story = StoryObj<typeof meta>

export const Horizontal: Story = {
  render: (args) => ({
    components: { GsDivider },
    setup: () => ({ args }),
    template: `
      <div style="width: 320px" class="flex flex-col gap-s fg-primary-bold text-body-m">
        <span>Above</span>
        <GsDivider v-bind="args" />
        <span>Below</span>
      </div>`,
  }),
}

/** In a flex row, a vertical divider stretches to the row height. */
export const VerticalInFlex: Story = {
  args: { orientation: 'vertical' },
  render: (args) => ({
    components: { GsDivider },
    setup: () => ({ args }),
    template: `
      <div class="flex items-center gap-s fg-primary-bold text-body-m">
        <span>One</span>
        <GsDivider v-bind="args" />
        <span class="py-l">Two (taller)</span>
        <GsDivider v-bind="args" />
        <span>Three</span>
      </div>`,
  }),
}

/** In a block container with a definite height, a vertical divider fills it. */
export const VerticalInBlock: Story = {
  args: { orientation: 'vertical' },
  render: (args) => ({
    components: { GsDivider },
    setup: () => ({ args }),
    template: '<div class="h-xxl"><GsDivider v-bind="args" /></div>',
  }),
}
