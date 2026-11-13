import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import GsSearchField from './GsSearchField.vue'
import GsTextAreaField from './GsTextAreaField.vue'
import GsTextField from './GsTextField.vue'

const meta = {
  title: 'Components/TextField',
  component: GsTextField,
  args: {
    label: 'Callsign',
    description: 'As filed in the flight plan',
    placeholder: 'e.g. RAVEN 21',
    size: 'medium',
    required: false,
    disabled: false,
    readonly: false,
    invalid: false,
    errorMessage: '',
  },
  argTypes: { size: { control: 'inline-radio', options: ['medium', 'small'] } },
  render: (args) => ({
    components: { GsTextField },
    setup: () => ({ args, value: ref('') }),
    template: '<GsTextField v-bind="args" v-model="value" style="width: 320px" />',
  }),
} satisfies Meta<typeof GsTextField>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const WithError: Story = { args: { errorMessage: 'Unknown callsign' } }

/** Validation runs through Reka UI's `FieldRoot`. Type fewer than 3 characters. */
export const CustomValidation: Story = {
  render: (args) => ({
    components: { GsTextField },
    setup: () => ({
      args,
      value: ref(''),
      validate: (v: unknown) => (String(v).length < 3 ? 'Use at least 3 characters' : null),
    }),
    template: `
      <GsTextField
        v-bind="args"
        v-model="value"
        validation-mode="onChange"
        :validate="validate"
        style="width: 320px"
      />`,
  }),
}

export const TextArea: Story = {
  render: () => ({
    components: { GsTextAreaField },
    setup: () => ({ value: ref('') }),
    template: `
      <GsTextAreaField
        v-model="value"
        label="Notes"
        description="Visible to the whole cell"
        placeholder="Add notes"
        :rows="4"
        style="width: 320px"
      />`,
  }),
}

export const Search: Story = {
  render: () => ({
    components: { GsSearchField },
    setup: () => ({ value: ref(''), loading: ref(false), submitted: ref('') }),
    template: `
      <div class="flex flex-col gap-m" style="width: 320px">
        <GsSearchField v-model="value" aria-label="Search tracks" placeholder="Search tracks" @submit="submitted = $event" />
        <GsSearchField v-model="value" variant="filled" aria-label="Search (filled)" placeholder="Filled variant" :loading="loading" />
        <label class="flex gap-s text-body-s"><input v-model="loading" type="checkbox" /> loading</label>
        <span class="text-body-s fg-primary-muted">Submitted: {{ submitted }}</span>
      </div>`,
  }),
}
