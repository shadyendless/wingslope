import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import { ref } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import GsButton from './GsButton.vue'
import GsLinkButton from './GsLinkButton.vue'
import GsToggleButton from './GsToggleButton.vue'

/** Text, or a placeholder icon for the `icon` variant (which then needs an `aria-label`). */
const content = `
  <GsIcon v-if="args.variant === 'icon'"><PlaceholderIcon /></GsIcon>
  <template v-else>Button</template>`

const iconLabel = `:aria-label="args.variant === 'icon' ? 'Button' : undefined"`

const meta = {
  title: 'Components/Button',
  component: GsButton,
  args: {
    color: 'mono-muted',
    size: 'medium',
    variant: 'filled',
    disabled: false,
  },
  argTypes: {
    color: {
      control: 'select',
      options: ['mono-muted', 'mono-bold', 'accent', 'serious', 'critical'],
    },
    size: {
      control: 'select',
      options: ['large', 'medium', 'small', 'xsmall'],
    },
    variant: {
      control: 'select',
      options: ['filled', 'outline', 'flat', 'icon'],
    },
  },
} satisfies Meta<typeof GsButton>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsButton, GsIcon, PlaceholderIcon },
    setup: () => ({ args }),
    template: `<GsButton v-bind="args" ${iconLabel}>${content}</GsButton>`,
  }),
}

export const Link: Story = {
  render: (args) => ({
    components: { GsLinkButton, GsIcon, PlaceholderIcon },
    setup: () => ({ args }),
    template: `<GsLinkButton v-bind="args" href="#" ${iconLabel}>${content}</GsLinkButton>`,
  }),
}

export const Toggle: Story = {
  args: {
    variant: 'flat',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'flat', 'icon'],
    },
  },
  render: (args) => ({
    components: { GsToggleButton, GsIcon, PlaceholderIcon },
    setup: () => ({ args, pressed: ref(false) }),
    template: `
      <div class="flex items-center gap-m">
        <GsToggleButton v-bind="args" v-model="pressed" ${iconLabel}>${content}</GsToggleButton>
        <span class="fg-primary-muted text-body-s">pressed: {{ pressed }}</span>
      </div>`,
  }),
}
