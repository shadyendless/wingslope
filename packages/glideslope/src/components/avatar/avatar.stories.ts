import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import GsBadge from '../badge/GsBadge.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsAvatar from './GsAvatar.vue'
import { provideAvatarDefaults } from './defaults'

// An inline image keeps Storybook working offline and independent of third-party hosts.
const sampleImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#004f7e"/><circle cx="16" cy="12" r="6" fill="#b1e9ff"/><path d="M4 32c2-8 7-11 12-11s10 3 12 11z" fill="#b1e9ff"/></svg>',
)}`

const meta = {
  title: 'Components/Avatar',
  component: GsAvatar,
  args: {
    alt: 'Jo Rivera',
    src: sampleImage,
    size: 'medium',
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['medium', 'small'],
    },
  },
  parameters: {
    controls: {
      include: ['src', 'alt', 'size', 'fallbackDelay', 'classes'],
    },
  },
  render: (args) => ({
    components: { GsAvatar },
    setup: () => ({ args }),
    template: '<GsAvatar v-bind="args" />',
  }),
} satisfies Meta<typeof GsAvatar>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithBadge: Story = {
  render: (args) => ({
    components: { GsAvatar, GsBadge },
    setup: () => ({ args }),
    template: `
      <div class="flex items-center gap-m">
        <GsAvatar v-bind="args"><GsBadge color="critical">99+</GsBadge></GsAvatar>
        <GsAvatar v-bind="args"><GsBadge color="serious">1</GsBadge></GsAvatar>
        <GsAvatar v-bind="args"><GsBadge color="normal" /></GsAvatar>
      </div>`,
  }),
}

export const WithContent: Story = {
  render: (args) => ({
    components: { GsAvatar, GsBadge, GsIcon, PlaceholderIcon },
    setup: () => ({ args }),
    template: `
      <div class="flex items-center gap-m">
        <GsAvatar v-bind="args">
          <span class="fg-primary-bold text-shadow-2xs">DS</span>
        </GsAvatar>
        <GsAvatar v-bind="args">
          <GsIcon class="fg-primary-bold"><PlaceholderIcon /></GsIcon>
        </GsAvatar>
        <GsAvatar v-bind="args" :classes="{ content: 'items-end' }">
          <GsBadge :offset="0" placement="bottom" color="critical">Offline</GsBadge>
        </GsAvatar>
      </div>`,
  }),
}

export const WithFallback: Story = {
  args: {
    alt: 'broken url',
    // A local path that 404s at once, so the fallback shows without waiting on DNS.
    src: '/missing-avatar.png',
  },
  render: (args) => ({
    components: { GsAvatar, GsIcon, PlaceholderIcon },
    setup: () => ({ args }),
    template: `
      <div class="flex items-center gap-m">
        <GsAvatar v-bind="args" />
        <GsAvatar v-bind="args">
          <template #fallback><GsIcon><PlaceholderIcon /></GsIcon></template>
        </GsAvatar>
        <GsAvatar v-bind="args">
          <template #fallback>DS</template>
        </GsAvatar>
      </div>`,
  }),
}

/** `provideAvatarDefaults()` sets the size of every avatar rendered below the calling component. */
export const Provider: Story = {
  render: (args) => ({
    components: { GsAvatar, GsBadge },
    setup: () => {
      provideAvatarDefaults(() => ({ size: args.size }))
      return { args }
    },
    template: `
      <div class="flex items-center gap-m">
        <GsAvatar :src="args.src" alt="Jo Rivera" />
        <GsAvatar :src="args.src" alt="Sam Lee"><GsBadge color="normal" /></GsAvatar>
        <GsAvatar alt="Dana Smith"><template #fallback>DS</template></GsAvatar>
      </div>`,
  }),
}
