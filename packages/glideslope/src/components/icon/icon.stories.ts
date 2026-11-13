import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { AddIcon } from '@wingbrace/glideslope-icons'
import GsIcon from './GsIcon.vue'
import { provideIconDefaults } from './defaults'

const meta = {
  title: 'Components/Icon',
  component: GsIcon,
  args: {
    class: 'fg-primary-bold',
  },
  argTypes: {
    class: {
      control: 'text',
      description: 'Classes on the icon. Its color follows `fg-*` and `icon-*` utilities.',
    },
    size: {
      control: 'select',
      options: ['large', 'medium', 'small', 'xsmall'],
    },
  },
} satisfies Meta<typeof GsIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsIcon, AddIcon },
    setup: () => ({ args }),
    template: '<GsIcon v-bind="args"><AddIcon /></GsIcon>',
  }),
}

/** `provideIconDefaults()` sets the size of every icon rendered below the calling component. */
export const Provider: Story = {
  render: (args) => ({
    components: { GsIcon, AddIcon },
    setup: () => {
      provideIconDefaults(() => ({ size: args.size }))
      return { args }
    },
    template: `
      <div :class="args.class">
        <GsIcon><AddIcon /></GsIcon>
        <GsIcon><AddIcon /></GsIcon>
        <GsIcon><AddIcon /></GsIcon>
      </div>`,
  }),
}
