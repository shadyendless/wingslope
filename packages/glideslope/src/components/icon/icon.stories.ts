import type { Meta, StoryObj } from '@storybook/vue3-vite'
import * as icons from '@wingbrace/glideslope-icons'
import { SettingsIcon } from '@wingbrace/glideslope-icons'
import { computed, ref } from 'vue'
import GsIcon from './GsIcon.vue'

const iconEntries = Object.entries(icons).filter(([name]) => name !== 'createIcon')

const meta = {
  title: 'Components/Icon',
  component: GsIcon,
  args: { size: 'medium' },
  argTypes: { size: { control: 'select', options: ['large', 'medium', 'small', 'xsmall'] } },
  render: (args) => ({
    components: { GsIcon, SettingsIcon },
    setup: () => ({ args }),
    template: '<GsIcon v-bind="args"><SettingsIcon /></GsIcon>',
  }),
} satisfies Meta<typeof GsIcon>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

/** Icon color follows `fg-*` (text and icon) or `icon-*` (icon only) utilities on any ancestor. */
export const Color: Story = {
  render: (args) => ({
    components: { GsIcon, SettingsIcon },
    setup: () => ({ args }),
    template: `
      <div class="flex gap-m">
        <GsIcon v-bind="args" class="fg-primary-bold"><SettingsIcon /></GsIcon>
        <GsIcon v-bind="args" class="fg-accent-primary-bold"><SettingsIcon /></GsIcon>
        <GsIcon v-bind="args" class="fg-serious-bold"><SettingsIcon /></GsIcon>
        <GsIcon v-bind="args" class="fg-critical-bold"><SettingsIcon /></GsIcon>
      </div>`,
  }),
}

/** Every icon in `@wingbrace/glideslope-icons`. */
export const Gallery: Story = {
  parameters: { layout: 'padded' },
  render: (args) => ({
    components: { GsIcon },
    setup() {
      const query = ref('')
      const filtered = computed(() =>
        iconEntries.filter(([name]) => name.toLowerCase().includes(query.value.toLowerCase())),
      )
      return { args, query, filtered }
    },
    template: `
      <div class="flex flex-col gap-l">
        <input
          v-model="query"
          placeholder="Filter icons"
          aria-label="Filter icons"
          class="bg-surface-raised fg-primary-bold rounded-medium px-s py-xs outline outline-interactive"
        />
        <ul class="grid gap-s" style="grid-template-columns: repeat(auto-fill, minmax(140px, 1fr))">
          <li
            v-for="[name, icon] in filtered"
            :key="name"
            class="bg-surface-raised rounded-medium p-s flex flex-col items-center gap-xs"
          >
            <GsIcon v-bind="args"><component :is="icon" /></GsIcon>
            <code class="text-body-xs fg-primary-muted">{{ name }}</code>
          </li>
        </ul>
      </div>`,
  }),
}
