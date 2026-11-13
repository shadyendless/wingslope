import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { KebabIcon, PlaceholderIcon } from '@wingbrace/glideslope-icons'
import { ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsMenu from '../menu/GsMenu.vue'
import GsMenuItem from '../menu/GsMenuItem.vue'
import GsList from './GsList.vue'
import GsListItem from './GsListItem.vue'
import GsListItemContent from './GsListItemContent.vue'
import GsListItemDescription from './GsListItemDescription.vue'
import GsListItemTitle from './GsListItemTitle.vue'

const parts = {
  GsList,
  GsListItem,
  GsListItemContent,
  GsListItemTitle,
  GsListItemDescription,
  GsButton,
  GsIcon,
  GsMenu,
  GsMenuItem,
  KebabIcon,
  PlaceholderIcon,
}

/** A row menu for the `#actions` slot. `label` is a template expression naming its button. */
const listItemMenu = (label: string) => `
  <template #actions>
    <GsMenu>
      <template #trigger>
        <GsButton variant="icon" :aria-label="${label}">
          <GsIcon><KebabIcon /></GsIcon>
        </GsButton>
      </template>
      <GsMenuItem label="Edit" />
      <GsMenuItem label="Delete" />
    </GsMenu>
  </template>`

const listItemIcon = `
  <GsIcon class="flex shrink-0 items-center justify-center fg-primary-bold">
    <PlaceholderIcon />
  </GsIcon>`

const listItemIndicator = `
  <div class="flex items-center justify-center gap-m rounded-round bg-surface-muted" aria-hidden="true">
    <GsIcon class="fg-primary-muted"><PlaceholderIcon /></GsIcon>
  </div>`

interface CustomListItem {
  id: number
  disabled?: boolean
  icon?: boolean
  title: string
  description?: string
  indicator?: boolean
}

const items: CustomListItem[] = [
  { id: 1, icon: true, title: 'Red Panda', description: 'Tree-dwelling mammal' },
  {
    id: 2,
    icon: true,
    title: 'Cat',
    description: 'Furry house pet',
    disabled: true,
    indicator: true,
  },
  { id: 3, icon: true, title: 'Dog', description: 'Loyal companion', indicator: true },
  { id: 4, icon: true, title: 'Aardvark', description: 'Ant-eating nocturnal' },
  { id: 5, title: 'Kangaroo', description: 'Pouch-bearing jumper' },
  { id: 6, icon: true, title: 'Snake', description: 'Slithering reptile' },
  { id: 7, title: 'Turtle' },
]

const meta = {
  title: 'Components/List',
  component: GsList,
  args: {
    variant: 'cozy',
  },
  argTypes: {
    variant: {
      control: 'select',
      options: ['cozy', 'compact'],
    },
    selectionMode: {
      control: 'select',
      options: ['none', 'single', 'multiple'],
    },
  },
} satisfies Meta<typeof GsList>

export default meta
type Story = StoryObj<typeof meta>

/** Selected rows show once `selectionMode` is `single` or `multiple`. */
export const Default: Story = {
  render: (args) => ({
    components: parts,
    setup: () => ({ args, items, selected: ref(['selected-1', 'selected-4']) }),
    template: `
      <div class="h-[400px] w-[300px]">
        <GsList v-bind="args" v-model="selected" aria-label="Animals list">
          <GsListItem
            v-for="item in items"
            :key="item.id"
            :value="\`selected-\${item.id}\`"
            :text-value="item.title"
            :disabled="item.disabled"
          >
            <template v-if="item.icon">${listItemIcon}</template>
            <GsListItemContent>
              <GsListItemTitle>{{ item.title }}</GsListItemTitle>
              <GsListItemDescription v-if="item.description">{{ item.description }}</GsListItemDescription>
            </GsListItemContent>
            <template v-if="item.indicator">${listItemIndicator}</template>
            ${listItemMenu("item.title + ' actions'")}
          </GsListItem>
        </GsList>
      </div>`,
  }),
}

export const Stateful: Story = {
  args: { selectionMode: 'multiple' },
  render: (args) => ({
    components: parts,
    setup: () => ({ args, selected: ref(['stateful-2', 'stateful-3']) }),
    template: `
      <GsList v-bind="args" v-model="selected" aria-label="Stateful items list">
        <GsListItem value="stateful-1" text-value="Stateful Item 1">
          ${listItemIcon}
          <GsListItemContent>
            <GsListItemTitle>Stateful Item 1</GsListItemTitle>
            <GsListItemDescription>This is a stateful list view item.</GsListItemDescription>
          </GsListItemContent>
          ${listItemMenu("'Stateful Item 1 actions'")}
        </GsListItem>
        <GsListItem value="stateful-2" text-value="Stateful Item 2">
          <GsListItemContent>
            <GsListItemTitle>Stateful Item 2</GsListItemTitle>
            <GsListItemDescription>Another stateful list view item.</GsListItemDescription>
          </GsListItemContent>
          ${listItemMenu("'Stateful Item 2 actions'")}
        </GsListItem>
        <GsListItem value="stateful-3" text-value="Stateful Item 3" disabled>
          <GsListItemContent>
            <GsListItemTitle>Stateful Item 3</GsListItemTitle>
            <GsListItemDescription>Another stateful list view item.</GsListItemDescription>
          </GsListItemContent>
          ${listItemIcon}
          ${listItemMenu("'Stateful Item 3 actions'")}
        </GsListItem>
      </GsList>`,
  }),
}

/**
 * Glideslope extra: controls in the `#actions` slot don't select the row, aren't part of its name,
 * and Tab reaches them only in the focused row. With `selectionMode: 'none'`, clicking a row or
 * pressing Enter emits `action`.
 */
export const RowActions: Story = {
  args: { selectionMode: 'multiple' },
  render: (args) => ({
    components: parts,
    setup: () => ({ args, items, selected: ref<string[]>([]), last: ref('') }),
    template: `
      <div class="flex w-[300px] flex-col gap-m">
        <GsList v-bind="args" v-model="selected" aria-label="Animals list">
          <GsListItem
            v-for="item in items.slice(0, 4)"
            :key="item.id"
            :value="item.title"
            :text-value="item.title"
            @action="last = item.title"
          >
            ${listItemIcon}
            <GsListItemContent>
              <GsListItemTitle>{{ item.title }}</GsListItemTitle>
              <GsListItemDescription>{{ item.description }}</GsListItemDescription>
            </GsListItemContent>
            <template #actions>
              <GsMenu>
                <template #trigger>
                  <GsButton variant="icon" :aria-label="\`\${item.title} actions\`">
                    <GsIcon><KebabIcon /></GsIcon>
                  </GsButton>
                </template>
                <GsMenuItem label="Edit" @select="last = \`Edit \${item.title}\`" />
                <GsMenuItem label="Delete" color="critical" @select="last = \`Delete \${item.title}\`" />
              </GsMenu>
            </template>
          </GsListItem>
        </GsList>
        <span class="fg-primary-muted text-body-s">
          Selected: {{ selected }}. Last action: {{ last || 'none' }}
        </span>
      </div>`,
  }),
}
