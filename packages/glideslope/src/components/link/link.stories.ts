import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsLink from './GsLink.vue'

const meta = {
  title: 'Components/Link',
  component: GsLink,
  args: { href: '#docs', disabled: false },
  render: (args) => ({
    components: { GsLink },
    setup: () => ({ args }),
    template:
      '<p class="fg-primary-bold text-body-m">Read the <GsLink v-bind="args">documentation</GsLink> first.</p>',
  }),
} satisfies Meta<typeof GsLink>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}
export const Disabled: Story = { args: { disabled: true } }
