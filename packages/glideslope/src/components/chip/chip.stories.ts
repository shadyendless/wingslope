import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import type { AcceptableValue } from 'reka-ui'
import { ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsChip from './GsChip.vue'
import GsChipList from './GsChipList.vue'
import GsDeletableChip from './GsDeletableChip.vue'
import GsSelectableChip from './GsSelectableChip.vue'

const colors = ['info', 'advisory', 'normal', 'serious', 'critical'] as const

const meta = {
  title: 'Components/Chip',
  component: GsChip,
  args: {
    size: 'medium',
  },
  argTypes: {
    default: { control: 'text' },
    size: { control: 'select', options: ['medium', 'small'] },
  },
} satisfies Meta<typeof GsChip>

export default meta

export const Default: StoryObj<typeof meta> = {
  args: {
    default: 'Chip',
    color: 'info',
  },
  argTypes: {
    color: { control: 'select', options: colors },
  },
  render: (args) => ({
    components: { GsChip, GsIcon, PlaceholderIcon },
    setup: () => ({ args }),
    template: `
      <GsChip :color="args.color" :size="args.size">
        <GsIcon><PlaceholderIcon /></GsIcon>
        {{ args.default }}
      </GsChip>`,
  }),
}

export const List: StoryObj<typeof meta> = {
  argTypes: {
    color: { control: 'select', options: colors },
  },
  parameters: {
    controls: {
      exclude: ['default', 'color'],
    },
  },
  render: (args) => ({
    components: { GsChip, GsChipList },
    setup: () => ({ args, colors }),
    template: `
      <GsChipList :size="args.size" aria-label="Chip colors">
        <GsChip v-for="color in colors" :key="color" :value="color" :color="color" class="capitalize">
          {{ color }}
        </GsChip>
      </GsChipList>`,
  }),
}

const selectableData = [
  { id: 'chip-1', label: 'Selectable chip' },
  { id: 'chip-2', label: 'Selectable chip' },
  { id: 'chip-3', label: 'Selectable chip' },
]

export const SelectableChipList: StoryObj<typeof GsChipList> = {
  args: {
    disallowEmptySelection: false,
    selectionMode: 'multiple',
    disabled: false,
  },
  argTypes: {
    selectionMode: { control: 'select', options: ['none', 'single', 'multiple'] },
  },
  parameters: {
    controls: {
      exclude: ['default'],
    },
  },
  render: (args) => ({
    components: { GsChipList, GsSelectableChip },
    setup: () => ({ args, items: selectableData, selected: ref<AcceptableValue[]>() }),
    template: `
      <GsChipList v-bind="args" v-model="selected" aria-label="Selectable chips">
        <GsSelectableChip v-for="item in items" :key="item.id" :value="item.id">
          {{ item.label }}
        </GsSelectableChip>
      </GsChipList>`,
  }),
}

const coloredSelectableData = [
  { id: 'up', label: '5 UP', color: 'normal' as const },
  { id: 'down', label: '2 DOWN', color: 'critical' as const },
  { id: 'all', label: '7 Total', color: 'info' as const },
]

export const SelectableChipListWithColors: StoryObj<typeof GsChipList> = {
  args: {
    disallowEmptySelection: false,
    selectionMode: 'single',
    disabled: false,
  },
  argTypes: {
    selectionMode: { control: 'select', options: ['none', 'single', 'multiple'] },
  },
  parameters: {
    controls: {
      exclude: ['default'],
    },
  },
  render: (args) => ({
    components: { GsChipList, GsSelectableChip },
    setup: () => ({ args, items: coloredSelectableData, selected: ref<AcceptableValue>() }),
    template: `
      <GsChipList v-bind="args" v-model="selected" aria-label="Status filter">
        <GsSelectableChip v-for="item in items" :key="item.id" :value="item.id" :color="item.color">
          {{ item.label }}
        </GsSelectableChip>
      </GsChipList>`,
  }),
}

const deletableChips = ['Deletable chip 1', 'Deletable chip 2', 'Deletable chip 3']

export const DeletableChipList: StoryObj<typeof GsChipList> = {
  args: {
    disabled: false,
  },
  parameters: {
    controls: {
      exclude: ['default'],
    },
  },
  render: (args) => ({
    components: { GsButton, GsChipList, GsDeletableChip },
    setup() {
      const chips = ref([...deletableChips])
      const remove = (values: AcceptableValue[]) =>
        (chips.value = chips.value.filter((chip) => !values.includes(chip)))
      const reset = () => (chips.value = [...deletableChips])
      return { args, chips, remove, reset }
    },
    template: `
      <div class="flex flex-col items-start gap-s">
        <GsChipList v-bind="args" aria-label="Deletable chips" @remove="remove">
          <GsDeletableChip v-for="chip in chips" :key="chip" :value="chip">{{ chip }}</GsDeletableChip>
        </GsChipList>
        <GsButton size="xsmall" variant="flat" @click="reset">Reset</GsButton>
      </div>`,
  }),
}
