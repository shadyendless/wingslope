import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { ref } from 'vue'
import GsChip from '../chip/GsChip.vue'
import GsChipList from '../chip/GsChipList.vue'
import GsDeletableChip from '../chip/GsDeletableChip.vue'
import GsSelectableChip from '../chip/GsSelectableChip.vue'
import GsSlider from './GsSlider.vue'

const meta = {
  title: 'Components/Slider',
  component: GsSlider,
  args: {
    label: 'Opacity',
    min: 0,
    max: 100,
    step: 1,
    orientation: 'horizontal',
    layout: 'grid',
    disabled: false,
    showLabel: true,
    showInput: false,
    showValueLabels: true,
    showMarkerLabels: false,
    snapToMarkers: false,
  },
  argTypes: {
    orientation: { control: 'inline-radio', options: ['horizontal', 'vertical'] },
    layout: { control: 'inline-radio', options: ['grid', 'stack'] },
  },
  render: (args) => ({
    components: { GsSlider },
    setup: () => ({ args, value: ref(40) }),
    template: `
      <div :style="args.orientation === 'vertical' ? 'height: 240px' : 'width: 320px'">
        <GsSlider v-bind="args" v-model="value" />
      </div>`,
  }),
} satisfies Meta<typeof GsSlider>

export default meta
type Story = StoryObj<typeof meta>

export const Playground: Story = {}

export const Range: Story = {
  args: { label: 'Altitude band', min: 0, max: 40000, step: 1000, showInput: true },
  render: (args) => ({
    components: { GsSlider },
    setup: () => ({ args, value: ref([8000, 24000]) }),
    template: '<div style="width: 360px"><GsSlider v-bind="args" v-model="value" /></div>',
  }),
}

export const Markers: Story = {
  args: {
    snapToMarkers: true,
    showMarkerLabels: true,
    markers: [
      { value: 0, label: 'Off' },
      { value: 25, label: 'Low' },
      { value: 50, label: 'Mid' },
      { value: 75, label: 'High' },
      { value: 100, label: 'Max' },
    ],
  },
}

export const Chips: Story = {
  render: () => ({
    components: { GsChip, GsChipList, GsSelectableChip, GsDeletableChip },
    setup: () => {
      const filters = ref(['air'])
      const assignees = ref(['Jo Rivera', 'Sam Chen', 'Alex Kim'])
      const remove = (values: unknown[]) =>
        (assignees.value = assignees.value.filter((name) => !values.includes(name)))
      return { filters, assignees, remove }
    },
    template: `
      <div class="flex flex-col gap-l">
        <div class="flex gap-s">
          <GsChip color="info">Info</GsChip>
          <GsChip color="advisory">Advisory</GsChip>
          <GsChip color="normal">Normal</GsChip>
          <GsChip color="serious">Serious</GsChip>
          <GsChip color="critical" size="small">Critical</GsChip>
        </div>
        <GsChipList v-model="filters" selection-mode="multiple" aria-label="Domain filters">
          <GsSelectableChip value="air">Air</GsSelectableChip>
          <GsSelectableChip value="sea">Sea</GsSelectableChip>
          <GsSelectableChip value="land">Land</GsSelectableChip>
          <GsSelectableChip value="space" disabled>Space</GsSelectableChip>
        </GsChipList>
        <GsChipList aria-label="Assignees" @remove="remove">
          <GsDeletableChip v-for="name in assignees" :key="name" :value="name">{{ name }}</GsDeletableChip>
        </GsChipList>
      </div>`,
  }),
}
