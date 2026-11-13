import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { AddIcon, PinIcon, SettingsIcon } from '@wingbrace/glideslope-icons'
import { ref } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import GsButton from './GsButton.vue'
import GsLinkButton from './GsLinkButton.vue'
import GsToggleButton from './GsToggleButton.vue'

const sizes = ['large', 'medium', 'small', 'xsmall'] as const
const colors = ['mono-muted', 'mono-bold', 'accent', 'serious', 'critical'] as const
const variants = ['filled', 'flat', 'outline', 'icon'] as const

const meta = {
  title: 'Components/Button',
  component: GsButton,
  args: {
    size: 'medium',
    color: 'mono-muted',
    variant: 'filled',
    disabled: false,
  },
  argTypes: {
    size: { control: 'select', options: sizes },
    color: { control: 'select', options: colors },
    variant: { control: 'select', options: variants },
  },
  render: (args) => ({
    components: { GsButton },
    setup: () => ({ args }),
    template: '<GsButton v-bind="args">Button</GsButton>',
  }),
} satisfies Meta<typeof GsButton>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithIcon: Story = {
  render: (args) => ({
    components: { GsButton, GsIcon, AddIcon },
    setup: () => ({ args }),
    template: '<GsButton v-bind="args"><GsIcon><AddIcon /></GsIcon>Add track</GsButton>',
  }),
}

export const IconOnly: Story = {
  args: { variant: 'icon' },
  render: (args) => ({
    components: { GsButton, GsIcon, SettingsIcon },
    setup: () => ({ args }),
    template:
      '<GsButton v-bind="args" aria-label="Settings"><GsIcon><SettingsIcon /></GsIcon></GsButton>',
  }),
}

/** Every variant and color at the current size. */
export const Matrix: Story = {
  parameters: { controls: { include: ['size', 'disabled'] } },
  render: (args) => ({
    components: { GsButton, GsIcon, SettingsIcon },
    setup: () => ({ args, colors, variants }),
    template: `
      <div class="grid gap-m" style="grid-template-columns: repeat(5, auto)">
        <template v-for="variant in variants" :key="variant">
          <GsButton
            v-for="color in colors"
            :key="color"
            :size="args.size"
            :disabled="args.disabled"
            :variant="variant"
            :color="color"
            :aria-label="variant === 'icon' ? color : undefined"
          >
            <GsIcon v-if="variant === 'icon'"><SettingsIcon /></GsIcon>
            <template v-else>{{ color }}</template>
          </GsButton>
        </template>
      </div>`,
  }),
}

export const LinkButton: Story = {
  render: (args) => ({
    components: { GsLinkButton },
    setup: () => ({ args }),
    template: '<GsLinkButton v-bind="args" href="#reports">Reports</GsLinkButton>',
  }),
}

export const ToggleButton: Story = {
  args: { variant: 'flat' },
  argTypes: { variant: { control: 'select', options: ['flat', 'outline', 'icon'] } },
  render: (args) => ({
    components: { GsToggleButton, GsIcon, PinIcon },
    setup: () => ({ args, pressed: ref(false) }),
    template: `
      <div class="flex items-center gap-m">
        <GsToggleButton v-bind="args" v-model="pressed" aria-label="Pin">
          <GsIcon><PinIcon /></GsIcon>
          <template v-if="args.variant !== 'icon'">Pin</template>
        </GsToggleButton>
        <span class="fg-primary-muted text-body-s">pressed: {{ pressed }}</span>
      </div>`,
  }),
}
