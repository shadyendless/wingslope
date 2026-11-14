import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsButton from '../button/GsButton.vue'
import GsDrawer from './GsDrawer.vue'
import GsDrawerClose from './GsDrawerClose.vue'
import GsDrawerContent from './GsDrawerContent.vue'
import GsDrawerFooter from './GsDrawerFooter.vue'
import GsDrawerHeader from './GsDrawerHeader.vue'
import GsDrawerHeaderTitle from './GsDrawerHeaderTitle.vue'
import GsDrawerLayout from './GsDrawerLayout.vue'
import GsDrawerLayoutMain from './GsDrawerLayoutMain.vue'
import GsDrawerMenu from './GsDrawerMenu.vue'
import GsDrawerMenuItem from './GsDrawerMenuItem.vue'
import GsDrawerPanel from './GsDrawerPanel.vue'
import GsDrawerTrigger from './GsDrawerTrigger.vue'
import GsDrawerView from './GsDrawerView.vue'
import type { GsDrawerMenuPosition, GsDrawerPlacement, GsDrawerSize } from './types'

type StoryArgs = {
  placement: GsDrawerPlacement
  size: GsDrawerSize
  position: GsDrawerMenuPosition
  toggle: boolean
}

const components = {
  GsButton,
  GsDrawer,
  GsDrawerClose,
  GsDrawerContent,
  GsDrawerFooter,
  GsDrawerHeader,
  GsDrawerHeaderTitle,
  GsDrawerLayout,
  GsDrawerLayoutMain,
  GsDrawerMenu,
  GsDrawerMenuItem,
  GsDrawerPanel,
  GsDrawerTrigger,
  GsDrawerView,
}

const ids = {
  drawer: 'drawer-story',
  a: 'drawer-story-a',
  b: 'drawer-story-b',
  c: 'drawer-story-c',
}

const meta = {
  title: 'Components/Drawer',
  component: GsDrawer,
  args: {
    placement: 'left',
    size: 'medium',
    position: 'center',
    toggle: false,
  },
  argTypes: {
    size: {
      control: 'select',
      options: ['small', 'medium', 'large'],
      description: 'The size of the drawer panel',
      table: {
        defaultValue: { summary: 'medium' },
      },
    },
    placement: {
      control: 'select',
      options: ['top', 'bottom', 'left', 'right'],
      description: 'The placement/position of the drawer',
      table: {
        defaultValue: { summary: 'left' },
      },
    },
    position: {
      control: 'select',
      options: ['start', 'center', 'end'],
      description: 'The position of the menu items within the menu bar',
      table: {
        defaultValue: { summary: 'center' },
      },
    },
    toggle: {
      control: 'boolean',
      description:
        'When true, clicking a menu item toggles the view open/closed. When false, clicking only opens.',
      table: {
        defaultValue: { summary: 'false' },
      },
    },
  },
  parameters: {
    layout: 'fullscreen',
  },
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<StoryArgs>

/** Three menu items for views A, B and C, or just A. */
const menu = (views: string[]) => `
  <GsDrawerMenu :position="args.position" aria-label="Views">
    ${views
      .map(
        (view) =>
          `<GsDrawerMenuItem :toggle="args.toggle" :for="ids.${view.toLowerCase()}" text-value="Menu ${view}">${view}</GsDrawerMenuItem>`,
      )
      .join('\n')}
  </GsDrawerMenu>`

export const StaticHeaderFooter: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, ids }),
    template: `
      <div class="h-screen bg-surface-muted fg-primary-bold">
        <GsDrawerLayout>
          <GsDrawer :id="ids.drawer" :placement="args.placement" :size="args.size" :default-view="ids.a">
            ${menu(['A', 'B', 'C'])}
            <GsDrawerPanel>
              <GsDrawerHeader>
                <GsDrawerHeaderTitle>Title</GsDrawerHeaderTitle>
                <GsDrawerClose />
              </GsDrawerHeader>
              <GsDrawerContent>
                <GsDrawerView :id="ids.a">View A</GsDrawerView>
                <GsDrawerView :id="ids.b">View B</GsDrawerView>
                <GsDrawerView :id="ids.c">View C</GsDrawerView>
              </GsDrawerContent>
              <GsDrawerFooter>Footer</GsDrawerFooter>
            </GsDrawerPanel>
          </GsDrawer>
        </GsDrawerLayout>
      </div>`,
  }),
}

export const DynamicHeaderFooter: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, ids }),
    template: `
      <div class="h-screen bg-surface-muted fg-primary-bold">
        <GsDrawerLayout>
          <GsDrawer :id="ids.drawer" :placement="args.placement" :size="args.size" :default-view="ids.a">
            ${menu(['A', 'B', 'C'])}
            <GsDrawerPanel>
              <GsDrawerView v-for="view in ['A', 'B', 'C']" :id="ids[view.toLowerCase()]" :key="view">
                <GsDrawerHeader>
                  <GsDrawerHeaderTitle>Title {{ view }}</GsDrawerHeaderTitle>
                </GsDrawerHeader>
                <GsDrawerContent>Content {{ view }}</GsDrawerContent>
                <GsDrawerFooter>Footer {{ view }}</GsDrawerFooter>
              </GsDrawerView>
            </GsDrawerPanel>
          </GsDrawer>
        </GsDrawerLayout>
      </div>`,
  }),
}

export const OpenCloseTrigger: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, ids }),
    template: `
      <div class="h-screen fg-primary-bold">
        <GsDrawerLayout>
          <GsDrawerLayoutMain>
            <div class="flex h-full items-center justify-center bg-surface-muted">
              <GsDrawerTrigger :for="'open:' + ids.a">
                <GsButton>Open</GsButton>
              </GsDrawerTrigger>
            </div>
          </GsDrawerLayoutMain>
          <GsDrawer :id="ids.drawer" :placement="args.placement" :size="args.size">
            ${menu(['A'])}
            <GsDrawerPanel>
              <GsDrawerView :id="ids.a">
                <GsDrawerHeader>
                  <GsDrawerHeaderTitle>Title A</GsDrawerHeaderTitle>
                  <GsDrawerClose :for="ids.a" />
                </GsDrawerHeader>
                <GsDrawerContent>Content A</GsDrawerContent>
                <GsDrawerFooter>Footer A</GsDrawerFooter>
              </GsDrawerView>
            </GsDrawerPanel>
          </GsDrawer>
        </GsDrawerLayout>
      </div>`,
  }),
}

export const SimpleStack: Story = {
  render: (args) => ({
    components,
    setup: () => ({ args, ids }),
    template: `
      <div class="h-screen bg-surface-muted fg-primary-bold">
        <GsDrawerLayout>
          <GsDrawer :id="ids.drawer" :placement="args.placement" :size="args.size" :default-view="ids.a">
            ${menu(['A'])}
            <GsDrawerPanel>
              <GsDrawerView :id="ids.a">
                <GsDrawerHeader title="Title A" />
                <GsDrawerContent>Content A</GsDrawerContent>
                <GsDrawerFooter>
                  <GsDrawerTrigger :for="ids.b">
                    <GsButton variant="outline">Show B</GsButton>
                  </GsDrawerTrigger>
                </GsDrawerFooter>
              </GsDrawerView>
              <GsDrawerView :id="ids.b">
                <GsDrawerHeader title="Title B" />
                <GsDrawerContent>Content B</GsDrawerContent>
                <GsDrawerFooter>Footer B</GsDrawerFooter>
              </GsDrawerView>
            </GsDrawerPanel>
          </GsDrawer>
        </GsDrawerLayout>
      </div>`,
  }),
}
