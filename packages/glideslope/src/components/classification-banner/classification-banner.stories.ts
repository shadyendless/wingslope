import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsClassificationBanner from './GsClassificationBanner.vue'

const meta = {
  title: 'Components/ClassificationBanner',
  component: GsClassificationBanner,
  args: {
    default: '',
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
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<typeof GsClassificationBanner>

export default meta
type Story = StoryObj<typeof meta>

/** An empty `default` slot shows the level's name. */
export const Default: Story = {
  render: (args) => ({
    components: { GsClassificationBanner },
    setup: () => ({ args }),
    template: `
      <GsClassificationBanner :variant="args.variant">
        <template v-if="args.default" #default>{{ args.default }}</template>
      </GsClassificationBanner>`,
  }),
}
