import type { Meta, StoryObj } from '@storybook/vue3-vite'
import ExpandLeftPanelIcon from '@wingbrace/glideslope-icons/expand-left-panel'
import PlaceholderIcon from '@wingbrace/glideslope-icons/placeholder'
import { onMounted, ref } from 'vue'
import GsAvatar from '../avatar/GsAvatar.vue'
import GsButton from '../button/GsButton.vue'
import GsDivider from '../divider/GsDivider.vue'
import GsDrawerLayout from '../drawer/GsDrawerLayout.vue'
import GsDrawerLayoutMain from '../drawer/GsDrawerLayoutMain.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsSwitch from '../switch/GsSwitch.vue'
import GsSidenav from './GsSidenav.vue'
import GsSidenavAvatar from './GsSidenavAvatar.vue'
import GsSidenavContent from './GsSidenavContent.vue'
import GsSidenavFooter from './GsSidenavFooter.vue'
import GsSidenavHeader from './GsSidenavHeader.vue'
import GsSidenavHeading from './GsSidenavHeading.vue'
import GsSidenavItem from './GsSidenavItem.vue'
import GsSidenavLink from './GsSidenavLink.vue'
import GsSidenavMenu from './GsSidenavMenu.vue'
import GsSidenavMenuItem from './GsSidenavMenuItem.vue'
import GsSidenavText from './GsSidenavText.vue'
import GsSidenavTrigger from './GsSidenavTrigger.vue'
import { useSidenavs } from './use-sidenavs'

// An inline image keeps Storybook working offline and independent of third-party hosts.
const avatarImage = `data:image/svg+xml,${encodeURIComponent(
  '<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><rect width="32" height="32" fill="#004f7e"/><circle cx="16" cy="12" r="6" fill="#b1e9ff"/><path d="M4 32c2-8 7-11 12-11s10 3 12 11z" fill="#b1e9ff"/></svg>',
)}`

// This story has a mix of controls from different components: `pushLayout` sets the layout's `push`.
type StoryArgs = {
  pushLayout: boolean
  hiddenWhenClosed: boolean
}

const components = {
  GsAvatar,
  GsButton,
  GsDivider,
  GsDrawerLayout,
  GsDrawerLayoutMain,
  GsIcon,
  GsSidenav,
  GsSidenavAvatar,
  GsSidenavContent,
  GsSidenavFooter,
  GsSidenavHeader,
  GsSidenavHeading,
  GsSidenavItem,
  GsSidenavLink,
  GsSidenavMenu,
  GsSidenavMenuItem,
  GsSidenavText,
  GsSidenavTrigger,
  GsSwitch,
  ExpandLeftPanelIcon,
  PlaceholderIcon,
}

const meta = {
  title: 'Components/Sidenav',
  component: GsSidenav,
  args: {
    pushLayout: true,
    hiddenWhenClosed: false,
  },
  parameters: {
    layout: 'fullscreen',
    docs: {
      subtitle: 'Collapsible side navigation for hierarchical navigation',
    },
  },
} satisfies Meta<StoryArgs>

export default meta
type Story = StoryObj<StoryArgs>

const sections = {
  'Title A': [
    { id: 'sidenav-story-item-1', text: 'Nav item', disabled: true },
    { id: 'sidenav-story-item-2', text: 'Nav item', disabled: false },
    { id: 'sidenav-story-item-3', text: 'Nav item', disabled: false },
  ],
}

/** The top bar holding the trigger that toggles the sidenav. */
const topBar = (id: string) => `
  <nav class="flex items-center bg-surface-default p-m" aria-label="Toolbar">
    <GsSidenavTrigger for="${id}">
      <GsButton variant="icon" size="large" aria-label="Toggle navigation">
        <GsIcon><ExpandLeftPanelIcon /></GsIcon>
      </GsButton>
    </GsSidenavTrigger>
  </nav>`

const header = `
  <GsSidenavHeader>
    <GsSidenavAvatar>
      <GsIcon><PlaceholderIcon /></GsIcon>
      <GsSidenavHeading>Application Header</GsSidenavHeading>
      <GsSidenavText>Secondary Text</GsSidenavText>
    </GsSidenavAvatar>
  </GsSidenavHeader>`

export const Default: Story = {
  render: (args) => ({
    components,
    setup: () => {
      const activeItem = ref<string | null>(sections['Title A'][2]?.id ?? null)
      const toggleItem = (id: string) => {
        activeItem.value = activeItem.value === id ? null : id
      }
      return { args, sections, activeItem, toggleItem, id: 'sidenav-story' }
    },
    template: `
      <div class="h-screen bg-surface-raised">
        <GsDrawerLayout :push="args.pushLayout ? 'left' : undefined">
          <GsDrawerLayoutMain>${topBar('sidenav-story')}</GsDrawerLayoutMain>
          <GsSidenav :id="id" :hidden-when-closed="args.hiddenWhenClosed" aria-label="Main">
            ${header}
            <GsSidenavContent>
              <template v-for="(items, section, index) in sections" :key="section">
                <GsSidenavHeading>{{ section }}</GsSidenavHeading>
                <GsSidenavItem
                  v-for="item in items"
                  :id="item.id"
                  :key="item.id"
                  :text-value="item.text"
                  :disabled="item.disabled"
                  :model-value="activeItem === item.id"
                  @update:model-value="toggleItem(item.id)"
                >
                  <GsIcon><PlaceholderIcon /></GsIcon>
                  <GsSidenavText>{{ item.text }}</GsSidenavText>
                </GsSidenavItem>
                <GsDivider v-if="index !== Object.keys(sections).length - 1" />
              </template>
              <GsDivider />
              <GsSidenavHeading>External</GsSidenavHeading>
              <GsSidenavLink href="#" text-value="Nav Link">
                <GsIcon><PlaceholderIcon /></GsIcon>
                <GsSidenavText>Nav Link</GsSidenavText>
              </GsSidenavLink>
              <GsSidenavLink disabled href="#" text-value="Nav Link">
                <GsIcon><PlaceholderIcon /></GsIcon>
                <GsSidenavText>Nav Link</GsSidenavText>
              </GsSidenavLink>

              <GsDivider />
              <GsSidenavHeading>Menu</GsSidenavHeading>
              <GsSidenavMenu title="Nav Item">
                <template #icon><GsIcon><PlaceholderIcon /></GsIcon></template>
                <GsSidenavMenuItem><GsSidenavText>Sub item</GsSidenavText></GsSidenavMenuItem>
                <GsSidenavMenuItem><GsSidenavText>Sub item</GsSidenavText></GsSidenavMenuItem>
                <GsSidenavMenuItem disabled><GsSidenavText>Sub item</GsSidenavText></GsSidenavMenuItem>
              </GsSidenavMenu>
            </GsSidenavContent>
            <GsSidenavFooter>
              <GsSidenavItem text-value="Application Footer">
                <GsSidenavAvatar>
                  <GsAvatar alt="Dog" src="${avatarImage}" />
                  <GsSidenavHeading>Application Footer</GsSidenavHeading>
                  <GsSidenavText>Secondary Text</GsSidenavText>
                </GsSidenavAvatar>
              </GsSidenavItem>
            </GsSidenavFooter>
          </GsSidenav>
        </GsDrawerLayout>
      </div>`,
  }),
}

let titleCaseInstances = 0

/**
 * Regression coverage for two Sidenav fixes:
 *
 * 1. **Heading case** — the `GsSidenavMenu` title "The Watch" and the avatar headings render
 *    verbatim instead of forced uppercase; only section headings ("Navigation") are uppercase.
 * 2. **Collapsed transient icons** — collapse the rail (click the trigger in the top bar) and the
 *    `GsSidenavLink` external-link arrow and the `GsSidenavHeader` chevron disappear instead of
 *    leaking into the rail.
 *
 * Starts expanded (it calls `useSidenavs().open()` on mount) so the title case is immediately
 * visible; toggle closed to verify the icons hide.
 */
export const TitleCaseAndCollapsedIcons: Story = {
  render: () => ({
    components,
    setup: () => {
      const navId = `sidenav-story-title-case-${++titleCaseInstances}`
      onMounted(() => useSidenavs().open(navId))
      return { navId }
    },
    template: `
      <div class="h-screen bg-surface-raised">
        <GsDrawerLayout push="left">
          <GsDrawerLayoutMain>
            <nav class="flex items-center bg-surface-default p-m" aria-label="Toolbar">
              <GsSidenavTrigger :for="navId">
                <GsButton variant="icon" size="large" aria-label="Toggle navigation">
                  <GsIcon><ExpandLeftPanelIcon /></GsIcon>
                </GsButton>
              </GsSidenavTrigger>
            </nav>
          </GsDrawerLayoutMain>
          <GsSidenav :id="navId" aria-label="Main">
            ${header}
            <GsSidenavContent>
              <GsSidenavHeading>Navigation</GsSidenavHeading>
              <GsSidenavLink href="https://example.com" target="_blank" text-value="Tools & Training">
                <GsIcon><PlaceholderIcon /></GsIcon>
                <GsSidenavText>Tools &amp; Training</GsSidenavText>
              </GsSidenavLink>
              <GsDivider />
              <GsSidenavHeading>Menu</GsSidenavHeading>
              <GsSidenavMenu title="The Watch">
                <template #icon><GsIcon><PlaceholderIcon /></GsIcon></template>
                <GsSidenavMenuItem><GsSidenavText>Sub item</GsSidenavText></GsSidenavMenuItem>
                <GsSidenavMenuItem><GsSidenavText>Sub item</GsSidenavText></GsSidenavMenuItem>
              </GsSidenavMenu>
            </GsSidenavContent>
          </GsSidenav>
        </GsDrawerLayout>
      </div>`,
  }),
}

/** Glideslope: `v-model:open` binds the sidenav's open state, here shown and set beside the layout. */
export const VModelOpen: Story = {
  render: () => ({
    components,
    setup: () => ({ open: ref(true) }),
    template: `
      <div class="flex h-screen flex-col bg-surface-raised">
        <div class="p-m"><GsSwitch v-model="open">Open</GsSwitch></div>
        <GsDrawerLayout push="left">
          <GsDrawerLayoutMain />
          <GsSidenav id="sidenav-story-v-model" v-model:open="open" aria-label="Main">
            ${header}
            <GsSidenavContent>
              <GsSidenavItem text-value="Nav item">
                <GsIcon><PlaceholderIcon /></GsIcon>
                <GsSidenavText>Nav item</GsSidenavText>
              </GsSidenavItem>
            </GsSidenavContent>
          </GsSidenav>
        </GsDrawerLayout>
      </div>`,
  }),
}
