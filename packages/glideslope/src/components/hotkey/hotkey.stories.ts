import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { MouseLeftClickIcon } from '@wingbrace/glideslope-icons'
import GsIcon from '../icon/GsIcon.vue'
import GsHotkey from './GsHotkey.vue'
import GsHotkeySet from './GsHotkeySet.vue'

const meta = {
  title: 'Components/Hotkey',
  component: GsHotkey,
  args: { variant: 'outline' },
  argTypes: { variant: { control: 'inline-radio', options: ['outline', 'flat', 'icon'] } },
  render: (args) => ({
    components: { GsHotkey },
    setup: () => ({ args }),
    template: '<GsHotkey v-bind="args">K</GsHotkey>',
  }),
} satisfies Meta<typeof GsHotkey>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Shortcut: Story = {
  render: () => ({
    components: { GsHotkey, GsHotkeySet, GsIcon, MouseLeftClickIcon },
    template: `
      <div class="flex flex-col gap-m">
        <GsHotkeySet>
          <GsHotkey>Ctrl</GsHotkey>+<GsHotkey>K</GsHotkey>
        </GsHotkeySet>
        <GsHotkeySet>
          <GsHotkey>Shift</GsHotkey>+
          <GsHotkey variant="icon"><GsIcon><MouseLeftClickIcon /></GsIcon></GsHotkey>
        </GsHotkeySet>
      </div>`,
  }),
}
