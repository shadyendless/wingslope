import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import GsSearchField from './GsSearchField.vue'
import { provideSearchFieldDefaults } from './defaults'

const meta = {
  title: 'Components/SearchField',
  component: GsSearchField,
  args: {
    placeholder: 'Search...',
    variant: 'outline',
    disabled: false,
    loading: false,
  },
  argTypes: {
    disabled: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
    variant: {
      control: 'select',
      options: ['outline', 'filled'],
      table: { defaultValue: { summary: 'outline' } },
    },
    loading: {
      control: 'boolean',
      table: { defaultValue: { summary: 'false' } },
    },
  },
  parameters: {
    docs: {
      subtitle: 'Search input with integrated icons and clear button',
    },
  },
} satisfies Meta<typeof GsSearchField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsSearchField },
    setup: () => ({ args, value: ref('') }),
    template:
      '<GsSearchField v-bind="args" v-model="value" aria-label="Storybook Search Field Component" />',
  }),
}

/** `v-model` holds the text; Enter emits `submit` with it, and Escape or the clear button emits `clear`. */
export const SubmitAndClear: Story = {
  render: (args) => ({
    components: { GsSearchField },
    setup: () => ({ args, value: ref(''), submitted: ref(''), cleared: ref(0) }),
    template: `
      <div class="flex w-[320px] flex-col gap-s">
        <GsSearchField
          v-bind="args"
          v-model="value"
          aria-label="Search tracks"
          @submit="submitted = $event"
          @clear="cleared++"
        />
        <span class="text-body-s fg-primary-muted">Submitted: {{ submitted }}</span>
        <span class="text-body-s fg-primary-muted">Cleared: {{ cleared }}</span>
      </div>`,
  }),
}

/**
 * `provideSearchFieldDefaults()` sets defaults (here `variant` and `disabled`) for every
 * `GsSearchField` below the calling component. A prop set on a field still wins.
 */
export const Provider: Story = {
  args: { variant: 'filled' },
  parameters: {
    controls: { include: ['variant', 'disabled'] },
  },
  render: (args) => ({
    components: { GsSearchField },
    setup() {
      provideSearchFieldDefaults(() => ({ variant: args.variant, disabled: args.disabled }))
      return { first: ref(''), second: ref('') }
    },
    template: `
      <div class="flex w-[320px] flex-col gap-s">
        <GsSearchField v-model="first" placeholder="Search 1" aria-label="Search 1" />
        <GsSearchField v-model="second" placeholder="Search 2" aria-label="Search 2" />
      </div>`,
  }),
}
