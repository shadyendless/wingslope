import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref, watch } from 'vue'
import GsTextAreaField from './GsTextAreaField.vue'
import { provideTextAreaFieldDefaults } from './defaults'

const meta = {
  title: 'Components/TextAreaField',
  component: GsTextAreaField,
  args: {
    label: 'Label',
    description: 'Helper text',
    errorMessage: '',
    size: 'medium',
    disabled: false,
    invalid: false,
    required: true,
    readonly: false,
    placeholder: 'Placeholder',
  },
  argTypes: {
    size: { control: 'select', options: ['medium', 'small'] },
    invalid: { control: 'boolean' },
    placeholder: { control: 'text' },
  },
  parameters: {
    docs: {
      subtitle: 'Multi-line text input with label and validation',
    },
  },
  render: (args) => ({
    components: { GsTextAreaField },
    setup() {
      const value = ref(args.modelValue ?? '')
      watch(
        () => args.modelValue,
        (next) => (value.value = next ?? ''),
      )
      return { args, value }
    },
    template: '<GsTextAreaField v-bind="args" v-model="value" />',
  }),
} satisfies Meta<typeof GsTextAreaField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const Readonly: Story = {
  args: {
    readonly: true,
    modelValue:
      'text area long blob text area long blob text area long blob text area long blob text area long blob text area long blob text area long blob text area long blob',
  },
}

/**
 * `provideTextAreaFieldDefaults()` sets defaults (here `size`, `disabled` and `required`) for every
 * `GsTextAreaField` below the calling component. A prop set on a field still wins.
 */
export const Provider: Story = {
  parameters: {
    controls: { include: ['size', 'disabled', 'required', 'readonly'] },
  },
  render: (args) => ({
    components: { GsTextAreaField },
    setup() {
      provideTextAreaFieldDefaults(() => ({
        size: args.size,
        disabled: args.disabled,
        required: args.required,
        readonly: args.readonly,
      }))
      return { bio: ref(''), comments: ref('') }
    },
    template: `
      <div class="flex w-[320px] flex-col gap-m">
        <GsTextAreaField v-model="bio" label="Bio" placeholder="Tell us about yourself" />
        <GsTextAreaField v-model="comments" label="Comments" placeholder="Additional comments" />
      </div>`,
  }),
}
