import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import { useTheme } from '../../composables/theme'
import type { GsColorInput } from './colors'
import GsColorPicker from './GsColorPicker.vue'
import GsCustomColorPicker from './GsCustomColorPicker.vue'
import GsNoColorButton from './GsNoColorButton.vue'

const presetColors = ['#ECECE6', '#898989', '#62a6ff', '#30D27E', '#FCA400', '#D4231D']

const meta = {
  title: 'Components/ColorPicker',
  component: GsColorPicker,
  args: {
    items: presetColors,
  },
  argTypes: {
    modelValue: {
      control: { type: 'color', presetColors },
    },
    // Logs selections in the Actions panel. The `update:modelValue` event is documented from the
    // component.
    'onUpdate:modelValue': { action: 'update:modelValue', table: { disable: true } },
    required: { control: 'boolean' },
    label: { control: 'text' },
  },
} satisfies Meta<typeof GsColorPicker>

export default meta
type Story = StoryObj<typeof meta>

/** Without a `label`, the picker needs an `aria-label`. */
export const Default: Story = {
  render: (args) => ({
    components: { GsColorPicker },
    setup: () => ({ args }),
    template: '<GsColorPicker aria-label="Color" v-bind="args" />',
  }),
}

export const WithLabel: Story = {
  args: {
    label: 'Pick a color',
  },
  render: (args) => ({
    components: { GsColorPicker },
    setup: () => ({ args }),
    template: '<GsColorPicker v-bind="args" />',
  }),
}

/** `v-model` holds the selected color; bound to a color string, it is updated with hex strings. */
export const Controlled: Story = {
  render: (args) => ({
    components: { GsColorPicker },
    setup: () => ({ args, color: ref<string | undefined>('#30D27E') }),
    template: `
      <div class="flex flex-col gap-s">
        <GsColorPicker aria-label="Color" v-bind="args" v-model="color" />
        <span class="text-body-s fg-primary-muted">value: {{ color }}</span>
      </div>`,
  }),
}

const rgbaItems: GsColorInput[] = [
  [236, 236, 230, 255],
  [137, 137, 137, 255],
  [98, 166, 255, 255],
  [48, 210, 126, 255],
  [252, 164, 0, 255],
  [212, 35, 29, 255],
]

/** Swatches can be RGBA tuples (0–255). A model bound to a tuple is updated with tuples. */
export const RgbaTuples: Story = {
  args: {
    items: rgbaItems,
  },
  render: (args) => ({
    components: { GsColorPicker },
    setup: () => ({ args, color: ref<GsColorInput | undefined>([48, 210, 126, 255]) }),
    template: `
      <div class="flex flex-col gap-s">
        <GsColorPicker aria-label="Color" v-bind="args" v-model="color" />
        <span class="text-body-s fg-primary-muted">value: {{ color }}</span>
      </div>`,
  }),
}

export const MixedItems: Story = {
  args: {
    items: ['#ECECE6', [98, 166, 255, 255], '#30D27E', [252, 164, 0, 255]],
  },
  render: (args) => ({
    components: { GsColorPicker },
    setup: () => ({ args }),
    template: '<GsColorPicker aria-label="Color" v-bind="args" />',
  }),
}

/** `useTheme().tokens` gives the theme's colors as RGBA tuples, which work directly as swatches. */
export const ThemeTokens: Story = {
  render: (args) => ({
    components: { GsColorPicker },
    setup() {
      const { tokens } = useTheme()
      const items = computed(() => {
        const { bg } = tokens.value
        return [
          bg.accent.primary.bold,
          bg.info.bold,
          bg.advisory.bold,
          bg.normal.bold,
          bg.serious.bold,
          bg.critical.bold,
        ]
      })
      const color = ref<GsColorInput | undefined>(tokens.value.bg.accent.primary.bold)
      return { args, items, color }
    },
    template: '<GsColorPicker aria-label="Color" v-bind="args" v-model="color" :items="items" />',
  }),
}

/** `GsNoColorButton` on its own, for building your own color controls. */
export const NoColorButtonStory: Story = {
  name: 'NoColorButton',
  render: () => ({
    components: { GsNoColorButton },
    setup: () => ({ clicked: ref(false) }),
    template: `
      <div class="flex flex-col gap-m text-body-s fg-primary-bold">
        <div class="flex items-center gap-s">
          <GsNoColorButton @click="clicked = !clicked" />
          <span>Clicked: {{ clicked ? 'Yes' : 'No' }}</span>
        </div>
        <div class="flex items-center gap-s">
          <GsNoColorButton disabled />
          <span>Disabled</span>
        </div>
      </div>`,
  }),
}

/** `GsCustomColorPicker` on its own: a button that opens the full picker, bound with `v-model`. */
export const CustomColorPickerStory: Story = {
  name: 'CustomColorPicker',
  render: () => ({
    components: { GsCustomColorPicker },
    setup: () => ({ color: ref<GsColorInput>('#30d27e') }),
    template: `
      <div class="flex flex-col gap-m text-body-s fg-primary-bold">
        <div class="flex items-center gap-s">
          <GsCustomColorPicker v-model="color" />
          <span>Current color: {{ color }}</span>
        </div>
        <div class="flex items-center gap-s">
          <GsCustomColorPicker model-value="#ff0000" disabled />
          <span>Disabled</span>
        </div>
      </div>`,
  }),
}

export const CombinedColorControls: Story = {
  name: 'Combined Controls',
  render: () => ({
    components: { GsColorPicker },
    setup: () => ({ items: presetColors, color: ref<string | undefined>('#30D27E') }),
    template: `
      <div class="flex flex-col gap-m">
        <GsColorPicker
          v-model="color"
          aria-label="Color"
          :items="items"
          allow-empty
          show-custom-picker
        />
        <div class="fg-primary-bold text-body-s">
          {{ color ? 'Selected: ' + color : 'No color selected' }}
        </div>
      </div>`,
  }),
}
