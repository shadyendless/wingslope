import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import GsIcon from '../icon/GsIcon.vue'
import GsLink from './GsLink.vue'
import { provideLinkDefaults } from './defaults'

const meta = {
  title: 'Components/Link',
  component: GsLink,
  args: {
    allowsVisited: false,
    href: '#',
    disabled: false,
    visited: false,
  },
  argTypes: {
    allowsVisited: {
      control: 'boolean',
    },
    disabled: {
      control: 'boolean',
    },
  },
} satisfies Meta<typeof GsLink>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsLink },
    setup: () => ({ args }),
    template: '<GsLink v-bind="args">Text</GsLink>',
  }),
}

export const CustomVisitedStyles: Story = {
  args: {
    allowsVisited: true,
  },
  render: (args) => ({
    components: { GsLink },
    setup: () => {
      provideLinkDefaults(() => ({
        allowsVisited: args.allowsVisited,
        class: 'enabled:visited:fg-accent-primary-pressed enabled:visited:underline',
      }))
      return { args }
    },
    template: '<GsLink :href="args.href" :disabled="args.disabled" visited>Text</GsLink>',
  }),
}

export const Multiple: Story = {
  render: (args) => ({
    components: { GsLink, GsIcon, PlaceholderIcon },
    setup: () => ({ args }),
    template: `
      <p class="fg-primary-bold">
        Some example text with a
        <GsLink v-bind="args">
          <GsIcon size="small"><PlaceholderIcon /></GsIcon>
          Text
        </GsLink>
        injected into it. There can be multiple
        <GsLink v-bind="args">
          <GsIcon size="small"><PlaceholderIcon /></GsIcon>
          Text
        </GsLink>
        here.
      </p>`,
  }),
}
