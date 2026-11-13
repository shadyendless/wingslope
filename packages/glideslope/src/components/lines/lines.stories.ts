import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsLines from './GsLines.vue'

const meta = {
  title: 'Components/Lines',
  component: GsLines,
  args: { size: 'medium', variant: 'branch', visible: true },
  argTypes: {
    size: { control: 'select', options: ['large', 'medium', 'small'] },
    variant: { control: 'select', options: ['branch', 'vert', 'last'] },
  },
} satisfies Meta<typeof GsLines>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsLines },
    setup: () => ({ args }),
    template: '<div class="w-l"><GsLines v-bind="args" /></div>',
  }),
}

/** How the variants combine to draw a small tree. */
export const Tree: Story = {
  render: () => ({
    components: { GsLines },
    template: `
      <div class="fg-primary-bold text-body-m">
        <div>Root</div>
        <div class="flex items-center"><div class="w-l"><GsLines variant="branch" /></div>Child A</div>
        <div class="flex items-center">
          <div class="w-l"><GsLines variant="vert" /></div>
          <div class="w-l"><GsLines variant="last" /></div>Grandchild
        </div>
        <div class="flex items-center"><div class="w-l"><GsLines variant="last" /></div>Child B</div>
      </div>`,
  }),
}
