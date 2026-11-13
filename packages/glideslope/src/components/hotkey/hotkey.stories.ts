import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { MouseRightClickIcon } from '@wingbrace/glideslope-icons'
import GsIcon from '../icon/GsIcon.vue'
import GsHotkey from './GsHotkey.vue'
import GsHotkeySet from './GsHotkeySet.vue'
import { provideHotkeyDefaults } from './defaults'

const meta = {
  title: 'Components/Hotkey',
  component: GsHotkey,
} satisfies Meta<typeof GsHotkey>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  args: {
    variant: 'outline',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'flat', 'icon'],
    },
  },
  render: (args) => ({
    components: { GsHotkey, GsIcon, MouseRightClickIcon },
    setup: () => ({ args }),
    template: `
      <div class="flex flex-col gap-xl">
        <GsHotkey v-bind="args">
          <GsIcon v-if="args.variant === 'icon'"><MouseRightClickIcon /></GsIcon>
          <template v-else>ctrl</template>
        </GsHotkey>
      </div>`,
  }),
}

export const KeysSet: Story = {
  render: () => ({
    components: { GsHotkey, GsHotkeySet, GsIcon, MouseRightClickIcon },
    template: `
      <div class="flex flex-col gap-xl">
        <GsHotkeySet>
          <GsHotkey>CMD</GsHotkey>
          <span>+</span>
          <GsHotkey variant="icon"><GsIcon><MouseRightClickIcon /></GsIcon></GsHotkey>
          <span>+</span>
          <GsHotkey>⌘V</GsHotkey>
        </GsHotkeySet>
        <GsHotkeySet>
          <GsHotkey>CMD</GsHotkey>
          <span>or</span>
          <GsHotkey variant="icon"><GsIcon><MouseRightClickIcon /></GsIcon></GsHotkey>
          <span>+</span>
          <GsHotkey>⌘V</GsHotkey>
        </GsHotkeySet>
      </div>`,
  }),
}

/** `provideHotkeyDefaults()` sets the variant of every hotkey rendered below the component. */
export const Provider: Story = {
  args: {
    variant: 'flat',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['outline', 'flat'],
    },
  },
  render: (args) => ({
    components: { GsHotkey, GsHotkeySet },
    setup: () => {
      provideHotkeyDefaults(() => ({ variant: args.variant }))
      return { args }
    },
    template: `
      <GsHotkeySet>
        <GsHotkey>Ctrl</GsHotkey>
        <span>+</span>
        <GsHotkey>C</GsHotkey>
      </GsHotkeySet>`,
  }),
}
