import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsBadge from '../badge/GsBadge.vue'
import GsAvatar from './GsAvatar.vue'

/** A tiny inline SVG so the story works offline. */
const sampleImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#004f7e"/><circle cx="16" cy="12" r="6" fill="#b1e9ff"/><path d="M4 32c2-8 7-11 12-11s10 3 12 11z" fill="#b1e9ff"/></svg>',
)}`

const meta = {
  title: 'Components/Avatar',
  component: GsAvatar,
  args: { size: 'medium', alt: 'Jo Rivera', src: sampleImage },
  argTypes: { size: { control: 'select', options: ['medium', 'small'] } },
  render: (args) => ({
    components: { GsAvatar },
    setup: () => ({ args }),
    template: '<GsAvatar v-bind="args" />',
  }),
} satisfies Meta<typeof GsAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const IconFallback: Story = { args: { src: undefined } }

export const InitialsFallback: Story = {
  args: { src: undefined },
  render: (args) => ({
    components: { GsAvatar },
    setup: () => ({ args }),
    template: '<GsAvatar v-bind="args"><template #fallback>JR</template></GsAvatar>',
  }),
}

export const WithBadge: Story = {
  render: (args) => ({
    components: { GsAvatar, GsBadge },
    setup: () => ({ args }),
    template: '<GsAvatar v-bind="args"><GsBadge color="normal" /></GsAvatar>',
  }),
}
