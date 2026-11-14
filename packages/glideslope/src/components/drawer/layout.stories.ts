import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ChevronDownIcon from '@wingbrace/glideslope-icons/chevron-down'
import ChevronLeftIcon from '@wingbrace/glideslope-icons/chevron-left'
import ChevronRightIcon from '@wingbrace/glideslope-icons/chevron-right'
import ChevronUpIcon from '@wingbrace/glideslope-icons/chevron-up'
import PlaceholderIcon from '@wingbrace/glideslope-icons/placeholder'
import GsDrawer from './GsDrawer.vue'
import GsDrawerClose from './GsDrawerClose.vue'
import GsDrawerContent from './GsDrawerContent.vue'
import GsDrawerHeader from './GsDrawerHeader.vue'
import GsDrawerHeaderTitle from './GsDrawerHeaderTitle.vue'
import GsDrawerLayout from './GsDrawerLayout.vue'
import GsDrawerLayoutMain from './GsDrawerLayoutMain.vue'
import GsDrawerMenu from './GsDrawerMenu.vue'
import GsDrawerMenuItem from './GsDrawerMenuItem.vue'
import GsDrawerPanel from './GsDrawerPanel.vue'
import GsDrawerView from './GsDrawerView.vue'
import type { GsDrawerLayoutExtend, GsDrawerPlacement } from './types'

type StoryArgs = {
  extend: GsDrawerLayoutExtend
  /** The multi-select control gives a list of edges; the layout takes them space-separated. */
  push?: string[]
}

const components = {
  GsDrawer,
  GsDrawerClose,
  GsDrawerContent,
  GsDrawerHeader,
  GsDrawerHeaderTitle,
  GsDrawerLayout,
  GsDrawerLayoutMain,
  GsDrawerMenu,
  GsDrawerMenuItem,
  GsDrawerPanel,
  GsDrawerView,
  ChevronDownIcon,
  ChevronLeftIcon,
  ChevronRightIcon,
  ChevronUpIcon,
  PlaceholderIcon,
}

const placements: GsDrawerPlacement[] = ['top', 'bottom', 'left', 'right']

/** A drawer id and four view ids per edge. */
const ids = Object.fromEntries(
  placements.map((placement) => [
    placement,
    {
      drawer: `drawer-layout-story-${placement}`,
      views: Object.fromEntries(
        ['a', 'b', 'c', 'd'].map((view) => [view, `drawer-layout-story-${placement}-${view}`]),
      ) as Record<'a' | 'b' | 'c' | 'd', string>,
    },
  ]),
) as Record<GsDrawerPlacement, { drawer: string; views: Record<'a' | 'b' | 'c' | 'd', string> }>

/** Each edge's drawer is tinted, and its first menu item points away from the edge. */
const edges = {
  top: { tint: 'bg-critical-bold/50', chevron: 'ChevronDownIcon', title: 'Top' },
  bottom: { tint: 'bg-advisory-bold/50', chevron: 'ChevronUpIcon', title: 'Bottom' },
  left: { tint: 'bg-serious-bold/50', chevron: 'ChevronRightIcon', title: 'Left' },
  right: { tint: 'bg-normal-bold/50', chevron: 'ChevronLeftIcon', title: 'Right' },
}

const chevronClass = 'cursor-pointer fg-primary-bold group-open/drawer:rotate-180'

const meta = {
  title: 'Components/DrawerLayout',
  component: GsDrawerLayout,
  args: {
    extend: 'left right',
  },
  argTypes: {
    extend: {
      control: 'select',
      options: ['top bottom', 'left right', 'top', 'bottom', 'left', 'right'],
      description:
        'Determines which drawers extend to full container dimensions, affecting the overall layout structure',
      table: {
        defaultValue: { summary: 'left right' },
      },
    },
    push: {
      control: 'multi-select',
      options: ['top', 'right', 'bottom', 'left'],
      description:
        'Determines how drawers interact with the main content area. When set, drawers push content aside rather than floating over it',
      table: {
        defaultValue: { summary: 'undefined' },
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<StoryArgs>

/** A decorative dot pattern behind the main content. */
const pattern = {
  '--single': '40px',
  '--double': 'calc(2 * var(--single))',
  backgroundImage: `
    radial-gradient(closest-side, transparent 98%, rgba(0,0,0,.8) 99%),
    radial-gradient(closest-side, transparent 98%, rgba(0,0,0,.4) 99%)
  `,
  backgroundSize: 'var(--double) var(--double)',
  backgroundPosition: 'center, calc(50% + var(--single)) calc(50% + var(--single))',
}

/** A drawer with four toggling menu items over a shared header and four empty views. */
const fourViewDrawer = (placement: GsDrawerPlacement) => {
  const { tint, chevron, title } = edges[placement]
  return `
    <GsDrawer
      :id="ids.${placement}.drawer"
      class="${tint}"
      placement="${placement}"
      size="medium"
      :default-view="ids.${placement}.views.a"
    >
      <GsDrawerMenu position="center" aria-label="${title} menu">
        <GsDrawerMenuItem toggle :for="ids.${placement}.views.a" text-value="Menu A">
          <${chevron} class="${chevronClass}" />
        </GsDrawerMenuItem>
        <GsDrawerMenuItem toggle :for="ids.${placement}.views.b" text-value="Menu B">
          <PlaceholderIcon />
        </GsDrawerMenuItem>
        <GsDrawerMenuItem toggle :for="ids.${placement}.views.c" text-value="Menu C">
          <PlaceholderIcon />
        </GsDrawerMenuItem>
        <GsDrawerMenuItem toggle :for="ids.${placement}.views.d" text-value="Menu D">
          <PlaceholderIcon />
        </GsDrawerMenuItem>
      </GsDrawerMenu>
      <GsDrawerPanel>
        <GsDrawerHeader>
          <GsDrawerHeaderTitle>${title}</GsDrawerHeaderTitle>
          <GsDrawerClose :for="ids.${placement}.views.a" />
        </GsDrawerHeader>
        <GsDrawerContent>
          <GsDrawerView v-for="id in ids.${placement}.views" :id="id" :key="id" />
        </GsDrawerContent>
      </GsDrawerPanel>
    </GsDrawer>`
}

export const Default: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, ids, pattern }),
    template: `
      <div class="h-screen w-full">
        <GsDrawerLayout :extend="args.extend" :push="args.push?.join(' ') || undefined">
          <GsDrawerLayoutMain>
            <div class="flex h-full items-center justify-center bg-surface-overlay" :style="pattern">
              <div class="flex w-1/2 flex-col rounded-large bg-surface-overlay p-xl outline-2 outline-info-bold">
                <p class="my-s">This page is for demo purposes only!</p>
              </div>
            </div>
          </GsDrawerLayoutMain>
          ${placements.map(fourViewDrawer).join('')}
        </GsDrawerLayout>
      </div>`,
  }),
}

/** A drawer with one toggling menu item over a single titled view. */
const sizedDrawer = (placement: GsDrawerPlacement, size: string) => {
  const { tint, chevron, title } = edges[placement]
  return `
    <GsDrawer
      :id="ids.${placement}.drawer"
      class="${tint}"
      placement="${placement}"
      size="${size}"
      :default-view="ids.${placement}.views.a"
    >
      <GsDrawerMenu position="center" aria-label="${title} menu">
        <GsDrawerMenuItem toggle :for="ids.${placement}.views.a" text-value="${title}">
          <${chevron} class="${chevronClass}" />
        </GsDrawerMenuItem>
      </GsDrawerMenu>
      <GsDrawerPanel>
        <GsDrawerView :id="ids.${placement}.views.a">
          <GsDrawerHeader>
            <GsDrawerHeaderTitle>${title} (${size})</GsDrawerHeaderTitle>
            <GsDrawerClose :for="ids.${placement}.views.a" />
          </GsDrawerHeader>
          <GsDrawerContent>${size[0]?.toUpperCase()}${size.slice(1)} drawer</GsDrawerContent>
        </GsDrawerView>
      </GsDrawerPanel>
    </GsDrawer>`
}

export const MixedSizes: Story = {
  parameters: {
    docs: {
      description: {
        story:
          'Four drawers open at once, each with a different `size`. Every edge sizes its own grid track independently, so the large left drawer and small right drawer render at their own widths with no cross-talk between edges.',
      },
    },
  },
  render: () => ({
    components,
    setup: () => ({ ids }),
    template: `
      <div class="h-screen w-full">
        <GsDrawerLayout extend="left right" push="left right top bottom">
          <GsDrawerLayoutMain>
            <div class="flex h-full items-center justify-center bg-surface-overlay">
              <p>Main content is pushed by each open drawer.</p>
            </div>
          </GsDrawerLayoutMain>
          ${sizedDrawer('left', 'large')}
          ${sizedDrawer('right', 'small')}
          ${sizedDrawer('top', 'medium')}
          ${sizedDrawer('bottom', 'large')}
        </GsDrawerLayout>
      </div>`,
  }),
}
