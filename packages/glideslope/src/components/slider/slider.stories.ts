import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref, watch } from 'vue'
import GsSlider from './GsSlider.vue'

const meta = {
  title: 'Components/Slider',
  component: GsSlider,
  args: {
    modelValue: 30,
    layout: 'grid',
    label: 'Opacity',
    max: 100,
    min: 0,
    orientation: 'horizontal',
    showInput: false,
    showLabel: true,
    showValueLabels: true,
    disabled: false,
  },
  parameters: {
    docs: {
      subtitle: 'Range input for numeric value selection',
    },
  },
  argTypes: {
    layout: { control: 'select', options: ['grid', 'stack'] },
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    markers: { control: 'object' },
    showMarkerLabels: { control: 'boolean' },
    snapToMarkers: { control: 'boolean' },
    showInput: { control: 'boolean' },
    showValueLabels: { control: 'boolean' },
  },
  render: (args) => ({
    components: { GsSlider },
    setup() {
      const value = ref(args.modelValue)
      watch(
        () => args.modelValue,
        (next) => (value.value = next),
      )
      return { args, value }
    },
    template: `
      <div :class="args.orientation === 'vertical' ? 'h-[300px] w-[200px]' : 'size-[400px]'">
        <GsSlider v-bind="args" v-model="value" />
      </div>`,
  }),
} satisfies Meta<typeof GsSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {}

export const WithInput: Story = {
  args: {
    modelValue: 50,
    label: 'Volume',
    showInput: true,
  },
}

export const Range: Story = {
  args: {
    modelValue: [20, 80],
  },
}

export const RangeWithInput: Story = {
  args: {
    modelValue: [20, 80],
    label: 'Price Range',
    showInput: true,
  },
}

export const WithEvenlySpacedMarkers: Story = {
  args: {
    modelValue: 50,
    label: 'Volume',
    markers: 5,
  },
}

export const WithSpecificMarkerValues: Story = {
  args: {
    modelValue: 50,
    label: 'Temperature (°F)',
    markers: [0, 32, 72, 100],
  },
}

export const WithLabeledMarkers: Story = {
  args: {
    modelValue: 50,
    label: 'Quality',
    markers: [
      { value: 0, label: 'Low' },
      { value: 50, label: 'Medium' },
      { value: 100, label: 'High' },
    ],
    showMarkerLabels: true,
  },
}

export const WithDetailedLabeledMarkers: Story = {
  args: {
    modelValue: 25,
    label: 'Video Quality',
    markers: [
      { value: 0, label: '480p' },
      { value: 25, label: '720p' },
      { value: 50, label: '1080p' },
      { value: 75, label: '1440p' },
      { value: 100, label: '4K' },
    ],
    showMarkerLabels: true,
  },
}

export const VerticalWithMarkers: Story = {
  args: {
    modelValue: 50,
    label: 'Brightness',
    orientation: 'vertical',
    markers: [
      { value: 0, label: 'Min' },
      { value: 50, label: '50%' },
      { value: 100, label: 'Max' },
    ],
    showMarkerLabels: true,
  },
}

export const RangeWithMarkers: Story = {
  args: {
    modelValue: [25, 75],
    label: 'Price Range',
    markers: [0, 25, 50, 75, 100],
  },
}

export const DisabledWithMarkers: Story = {
  args: {
    modelValue: 50,
    label: 'Disabled Slider',
    disabled: true,
    markers: 5,
  },
}

export const SnapToMarkers: Story = {
  args: {
    modelValue: 50,
    label: 'Discrete Selection',
    markers: [0, 25, 50, 75, 100],
    snapToMarkers: true,
  },
}

export const SnapToLabeledMarkers: Story = {
  args: {
    modelValue: 50,
    label: 'Rating',
    markers: [
      { value: 0, label: 'Poor' },
      { value: 25, label: 'Fair' },
      { value: 50, label: 'Good' },
      { value: 75, label: 'Great' },
      { value: 100, label: 'Excellent' },
    ],
    snapToMarkers: true,
    showMarkerLabels: true,
  },
}

export const SnapToUnevenMarkers: Story = {
  args: {
    modelValue: 0,
    label: 'Zoom Level',
    markers: [
      { value: 0, label: '1x' },
      { value: 10, label: '2x' },
      { value: 25, label: '4x' },
      { value: 50, label: '8x' },
      { value: 100, label: '16x' },
    ],
    snapToMarkers: true,
    showMarkerLabels: true,
  },
}

export const RangeWithSnap: Story = {
  args: {
    modelValue: [25, 75],
    label: 'Price Range',
    markers: [
      { value: 0, label: '$0' },
      { value: 25, label: '$25' },
      { value: 50, label: '$50' },
      { value: 75, label: '$75' },
      { value: 100, label: '$100' },
    ],
    snapToMarkers: true,
    showMarkerLabels: true,
  },
}
