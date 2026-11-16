import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsClassificationBadge from './GsClassificationBadge.vue'

const meta = {
  title: 'Components/ClassificationBadge',
  component: GsClassificationBadge,
  args: {
    default: '',
    size: 'medium',
    variant: 'missing',
  },
  argTypes: {
    default: {
      control: 'text',
    },
    variant: {
      control: 'select',
      options: ['missing', 'unclassified', 'cui', 'confidential', 'secret', 'top-secret', 'ts-sci'],
    },
    size: {
      control: 'select',
      options: ['medium', 'small'],
    },
  },
} satisfies Meta<typeof GsClassificationBadge>

export default meta
type Story = StoryObj<typeof meta>

/** An empty `default` slot shows the level's name. */
export const Default: Story = {
  render: (args) => ({
    components: { GsClassificationBadge },
    setup: () => ({ args }),
    template: `
      <GsClassificationBadge :variant="args.variant" :size="args.size">
        <template v-if="args.default" #default>{{ args.default }}</template>
      </GsClassificationBadge>`,
  }),
}
