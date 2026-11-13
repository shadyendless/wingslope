import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref, watch } from 'vue'
import GsTextField from './GsTextField.vue'
import { provideTextFieldDefaults } from './defaults'
import type { GsTextFieldProps } from './types'

const meta = {
  title: 'Components/TextField',
  component: GsTextField,
  args: {
    label: 'Label',
    placeholder: 'Placeholder',
    type: 'text',
    clearable: true,
    description: 'Helper text',
    errorMessage: '',
    size: 'medium',
    disabled: false,
    invalid: false,
    required: true,
    readonly: false,
  },
  argTypes: {
    size: { control: 'select', options: ['medium', 'small'] },
    readonly: { control: 'boolean' },
    minLength: { control: 'number' },
    maxLength: { control: 'number' },
  },
  parameters: {
    docs: {
      subtitle: 'Single-line text input with label and validation',
    },
  },
  render: (args) => ({
    components: { GsTextField },
    setup() {
      const value = ref(args.modelValue ?? '')
      watch(
        () => args.modelValue,
        (next) => (value.value = next ?? ''),
      )
      return { args, value }
    },
    template: '<GsTextField v-bind="args" v-model="value" />',
  }),
} satisfies Meta<typeof GsTextField>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsTextField },
    setup: () => ({ args, value: ref('') }),
    template: `
      <div class="max-w-[200px]">
        <GsTextField v-bind="args" v-model="value" />
      </div>`,
  }),
}

export const WithPrefix: Story = {
  args: {
    label: 'Price',
    placeholder: '0.00',
    type: 'number',
    description: 'Enter the price in dollars',
  },
  render: (args) => ({
    components: { GsTextField },
    setup: () => ({ args, value: ref('') }),
    template: `
      <GsTextField v-bind="args" v-model="value">
        <template #prefix>$</template>
      </GsTextField>`,
  }),
}

export const WithSuffix: Story = {
  args: {
    label: 'Weight',
    placeholder: '0',
    type: 'number',
    description: 'Enter the weight in kilograms',
  },
  render: (args) => ({
    components: { GsTextField },
    setup: () => ({ args, value: ref('') }),
    template: `
      <GsTextField v-bind="args" v-model="value">
        <template #suffix>kg</template>
      </GsTextField>`,
  }),
}

export const WithPrefixAndSuffix: Story = {
  args: {
    label: 'Temperature Range',
    placeholder: '0',
    type: 'number',
    description: 'Approximate temperature in Celsius',
  },
  render: (args) => ({
    components: { GsTextField },
    setup: () => ({ args, value: ref('') }),
    template: `
      <GsTextField v-bind="args" v-model="value">
        <template #prefix>~</template>
        <template #suffix>°C</template>
      </GsTextField>`,
  }),
}

/**
 * GsTextField takes the input's props directly; there is no `inputProps` object. Slots and other
 * attributes (such as `pattern`) reach the input too. The pattern is checked when the input loses
 * focus.
 */
export const WithInputProps: StoryObj<
  Pick<GsTextFieldProps, 'placeholder' | 'type' | 'clearable' | 'autoSize'> & {
    prefix?: string
    suffix?: string
    pattern?: string
  }
> = {
  parameters: {
    controls: {
      expanded: true,
      include: ['placeholder', 'type', 'clearable', 'autoSize', 'prefix', 'suffix', 'pattern'],
    },
  },
  args: {
    placeholder: 'Enter text...',
    type: 'text',
    clearable: true,
    autoSize: false,
    prefix: '',
    suffix: '',
    pattern: '',
  },
  argTypes: {
    clearable: { control: 'boolean' },
    autoSize: { control: 'boolean' },
    type: {
      control: 'select',
      options: ['text', 'email', 'password', 'search', 'tel', 'url', 'number'],
    },
    placeholder: { control: 'text' },
    prefix: { control: 'text' },
    suffix: { control: 'text' },
    pattern: {
      control: 'text',
      description:
        'Regex pattern for validation. Examples: `[A-Za-z]+` (letters only), `[0-9]{5}` (5 digits)',
    },
  },
  render: (args) => ({
    components: { GsTextField },
    setup: () => ({ args, value: ref('') }),
    template: `
      <GsTextField
        v-model="value"
        label="TextField with input props"
        description="Input props, slots and attributes go straight to GsTextField"
        validation-mode="onBlur"
        :placeholder="args.placeholder"
        :type="args.type"
        :clearable="args.clearable"
        :auto-size="args.autoSize"
        :pattern="args.pattern || undefined"
      >
        <template v-if="args.prefix" #prefix>{{ args.prefix }}</template>
        <template v-if="args.suffix" #suffix>{{ args.suffix }}</template>
      </GsTextField>`,
  }),
}

export const Readonly: Story = {
  args: {
    label: 'Readonly',
    readonly: true,
    modelValue: 'long long long long long long long long string',
  },
}

/** Custom validation through Reka UI's `FieldRoot` (`validate` and `validation-mode`). Type fewer than 3 characters. */
export const CustomValidation: Story = {
  args: { label: 'Callsign', description: 'As filed in the flight plan', required: false },
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
        class="w-[320px]"
      />`,
  }),
}

/**
 * `provideTextFieldDefaults()` sets defaults (here `size`, `disabled` and `required`) for every
 * `GsTextField` below the calling component. A prop set on a field still wins.
 */
export const Provider: Story = {
  parameters: {
    controls: { include: ['size', 'disabled', 'required', 'readonly'] },
  },
  render: (args) => ({
    components: { GsTextField },
    setup() {
      provideTextFieldDefaults(() => ({
        size: args.size,
        disabled: args.disabled,
        required: args.required,
        readonly: args.readonly,
      }))
      return { first: ref(''), last: ref('') }
    },
    template: `
      <div class="flex w-[320px] flex-col gap-m">
        <GsTextField v-model="first" label="First name" placeholder="Enter first name" />
        <GsTextField v-model="last" label="Last name" placeholder="Enter last name" />
      </div>`,
  }),
}
