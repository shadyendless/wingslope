import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import { defineComponent, h, ref, type Component } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsFloatingCard from './GsFloatingCard.vue'
import GsFloatingCardProvider from './GsFloatingCardProvider.vue'
import type {
  GsFloatingCardHeaderAction,
  GsFloatingCardProps,
  GsFloatingCardProviderProps,
} from './types'

/** Dashed placeholder filling a card. */
const CardContent = defineComponent({
  setup:
    (_, { slots }) =>
    () =>
      h(
        'div',
        {
          class:
            'flex h-full flex-col items-center justify-center gap-m self-stretch rounded-medium bg-surface-default p-m outline outline-dashed outline-interactive-hover',
        },
        h('p', { class: 'text-body-xs fg-primary-muted' }, slots.default?.()),
      ),
})

/** An emoji as an icon component, for header actions. */
function emoji(character: string, large = true): Component {
  return () => h('span', { class: large ? 'text-header-l' : undefined }, character)
}

const panelIds = {
  a: 'floating-card-a',
  b: 'floating-card-b',
  c: 'floating-card-c',
  d: 'floating-card-d',
  e: 'floating-card-e',
}

const components = {
  CardContent,
  GsButton,
  GsFloatingCard,
  GsFloatingCardProvider,
  PlaceholderIcon,
}

const meta = {
  title: 'Components/FloatingCard',
  component: GsFloatingCard,
  args: {
    id: panelIds.a,
    title: 'Test FloatingCard',
    open: true,
  },
} satisfies Meta<typeof GsFloatingCard>

export default meta
type Story = StoryObj<typeof meta>

/** Default story args: the card's own props plus the provider's `bounds`. */
type DefaultStoryArgs = GsFloatingCardProps & {
  open?: boolean
  bounds: GsFloatingCardProviderProps['bounds']
}

export const Default: StoryObj<DefaultStoryArgs> = {
  args: {
    bounds: 'provider',
  },
  argTypes: {
    bounds: {
      control: 'inline-radio',
      description:
        'Region cards are confined to while dragging and resizing. Drag the card past the outlined box to compare.',
      options: ['provider', 'viewport'],
      table: { defaultValue: { summary: 'provider' } },
    },
  },
  render: ({ bounds, ...args }) => ({
    components,
    setup: () => ({ args, bounds }),
    template: `
      <div class="relative h-800 w-600 p-l outline outline-info-bold">
        <GsFloatingCardProvider :bounds="bounds">
          <GsFloatingCard v-bind="args">
            <div class="flex h-full flex-col items-center justify-center gap-m self-stretch rounded-medium outline outline-dashed outline-interactive-hover">
              Panel Content
            </div>
          </GsFloatingCard>
        </GsFloatingCardProvider>
      </div>`,
  }),
}

export const WithHeaderActions: Story = {
  render: (args) => ({
    components,
    setup: () => {
      const headerActions: GsFloatingCardHeaderAction[] = [
        { icon: emoji('⚙️'), label: 'Action', onClick: () => window.alert('Action clicked') },
      ]
      return { args, headerActions }
    },
    template: `
      <div class="relative h-800 w-600 p-l outline outline-info-bold">
        <GsFloatingCardProvider :header-actions="headerActions">
          <template #icon><span class="text-header-l">🌟</span></template>
          <GsFloatingCard :id="args.id" :title="args.title">
            <div class="flex w-full items-start justify-center self-stretch p-0">
              <div class="flex flex-1 flex-col items-center justify-center p-s">
                <div class="flex h-full flex-col items-center justify-center gap-m self-stretch rounded-medium outline outline-dashed outline-interactive-hover">
                  Panel Content with Custom Headers
                </div>
              </div>
            </div>
          </GsFloatingCard>
        </GsFloatingCardProvider>
      </div>`,
  }),
}

export const Pinnable: Story = {
  render: () => ({
    components,
    setup: () => ({ panelIds }),
    template: `
      <div class="relative h-800 w-600 p-l outline outline-info-bold">
        <GsFloatingCardProvider :header-actions="['pin']">
          <template #icon><PlaceholderIcon /></template>
          <GsFloatingCard :id="panelIds.a" title="Pinnable Card">
            <CardContent>
              Click the pin button in the header — dragging will be disabled while pinned.
            </CardContent>
          </GsFloatingCard>
        </GsFloatingCardProvider>
      </div>`,
  }),
}

export const MultipleCards: Story = {
  render: () => ({
    components,
    setup: () => ({
      panelIds,
      headerActions: (id: string): GsFloatingCardHeaderAction[] =>
        id === panelIds.a ? ['pin'] : [],
    }),
    template: `
      <div class="relative h-1000 w-600 p-l outline outline-info-bold">
        <GsFloatingCardProvider :header-actions="headerActions">
          <template #icon><PlaceholderIcon /></template>
          <GsFloatingCard :id="panelIds.a" title="Card A" :initial-position="{ x: 24, y: 24 }">
            <CardContent>
              The header actions factory matched this card's id, so it has a pin button.
            </CardContent>
          </GsFloatingCard>
          <GsFloatingCard :id="panelIds.b" title="Card B" :initial-position="{ x: 132, y: 260 }">
            <CardContent>The same factory returned no actions for this card.</CardContent>
          </GsFloatingCard>
          <GsFloatingCard :id="panelIds.c" title="Card C" :initial-position="{ x: 240, y: 496 }">
            <CardContent>Each card is independently draggable and resizable.</CardContent>
          </GsFloatingCard>
        </GsFloatingCardProvider>
      </div>`,
  }),
}

export const CustomDimensions: Story = {
  render: () => ({
    components,
    setup: () => ({ panelIds }),
    template: `
      <div class="relative h-800 w-600 p-l outline outline-info-bold">
        <GsFloatingCardProvider>
          <GsFloatingCard
            :id="panelIds.a"
            title="Small Card"
            :initial-dimensions="{ width: 250, height: 200 }"
            :initial-position="{ x: 24, y: 24 }"
          >
            <div class="flex h-full flex-col items-center justify-center gap-m self-stretch rounded-medium outline outline-dashed outline-interactive-hover">
              Small dimensions
            </div>
          </GsFloatingCard>
          <GsFloatingCard
            :id="panelIds.b"
            title="Large Card"
            :initial-dimensions="{ width: 500, height: 400 }"
            :initial-position="{ x: 24, y: 268 }"
          >
            <div class="flex h-full flex-col items-center justify-center gap-m self-stretch rounded-medium outline outline-dashed outline-interactive-hover">
              Larger dimensions for more content
            </div>
          </GsFloatingCard>
        </GsFloatingCardProvider>
      </div>`,
  }),
}

export const WithHeaderActionDividers: Story = {
  render: (args) => ({
    components,
    setup: () => {
      const headerActions: GsFloatingCardHeaderAction[] = [
        { icon: emoji('📌', false), label: 'Pin', onClick: () => window.alert('Pin clicked') },
        { icon: emoji('🔗'), label: 'Share', onClick: () => window.alert('Share clicked') },
        'divider',
        { icon: emoji('⚙️'), label: 'Settings', onClick: () => window.alert('Settings clicked') },
        'divider',
        { icon: emoji('🗑️'), label: 'Delete', onClick: () => window.alert('Delete clicked') },
      ]
      return { args, headerActions }
    },
    template: `
      <div class="relative h-800 w-600 p-l outline outline-info-bold">
        <GsFloatingCardProvider :header-actions="headerActions">
          <template #icon><PlaceholderIcon /></template>
          <GsFloatingCard :id="args.id" :title="args.title">
            <div class="flex h-full flex-col items-center justify-center gap-m self-stretch rounded-medium outline outline-dashed outline-interactive-hover">
              Header actions separated by dividers
            </div>
          </GsFloatingCard>
        </GsFloatingCardProvider>
      </div>`,
  }),
}

export const ControlledVisibility: Story = {
  render: () => ({
    components,
    setup: () => ({ panelIds, isOpen: ref(true) }),
    template: `
      <div class="relative h-800 w-600 p-l outline outline-info-bold">
        <div class="absolute top-0 left-0 z-50 p-m">
          <GsButton @click="isOpen = !isOpen">{{ isOpen ? 'Close Card' : 'Open Card' }}</GsButton>
        </div>
        <GsFloatingCardProvider>
          <GsFloatingCard :id="panelIds.a" v-model:open="isOpen" title="Controllable Card">
            <div class="flex h-full flex-col items-center justify-center gap-m self-stretch rounded-medium outline outline-dashed outline-interactive-hover">
              <p class="text-body-s">This card can be opened and closed</p>
            </div>
          </GsFloatingCard>
        </GsFloatingCardProvider>
      </div>`,
  }),
}

export const WithScrollableContent: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, panelIds }),
    template: `
      <div class="relative h-800 w-600 p-l outline outline-info-bold">
        <GsFloatingCardProvider>
          <GsFloatingCard :id="panelIds.a" :title="args.title">
            <div class="flex h-full flex-col items-center justify-start gap-m self-stretch overflow-auto rounded-medium p-m" tabindex="0" aria-label="Scrollable content">
              <p v-for="i in 20" :key="i" class="text-body-s">Scrollable content line {{ i }}</p>
            </div>
          </GsFloatingCard>
        </GsFloatingCardProvider>
      </div>`,
  }),
}
