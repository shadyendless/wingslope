import type { Meta, StoryObj } from '@storybook/vue3-vite'
import * as Icon from '@wingbrace/glideslope-icons'
import { computed, ref, type Component } from 'vue'
import GsIcon from '../components/icon/GsIcon.vue'
import GsSearchField from '../components/text-field/GsSearchField.vue'

/**
 * Every icon in `@wingbrace/glideslope-icons`, by category. Names are the kebab-case file names
 * (`add-fill` is `AddFillIcon`, or the default export of `@wingbrace/glideslope-icons/add-fill`).
 * Some icons appear in more than one category.
 */
const catalog: Record<string, { description: string; icons: string[] }> = {
  actions: {
    description: 'These icons mainly represent an act a user can take in the user interface.',
    icons: [
      'add-fill',
      'add-to-list',
      'add',
      'arrange-table',
      'attach-file',
      'cancel',
      'cancel-fill',
      'center-on',
      'check',
      'collapse-window',
      'collapse-all',
      'condense',
      'copy-to-clipboard',
      'create-coa',
      'delete',
      'drag-horz',
      'drag-vert',
      'duplicate',
      'edit',
      'expand-all',
      'expand-left',
      'expand-left-panel',
      'expand-right',
      'expand-window',
      'expand',
      'explore-data',
      'fast-forward',
      'fast-rewind',
      'filter',
      'full-screen',
      'flag',
      'focus',
      'global-share',
      'group',
      'hide',
      'import',
      'insert-chart',
      'jump-to',
      'jump-to-start',
      'jump-to-end',
      'lasso',
      'link',
      'lock-fill',
      'lock-outline',
      'login',
      'logout',
      'loop',
      'move',
      'mute',
      'open-container',
      'paste-from-clipboard',
      'pause',
      'pin',
      'play',
      'playback',
      'polygon-lasso',
      'pop-back-in',
      'pop-out',
      'record',
      'rectangle-select',
      'remove-fill',
      'remove-from-list',
      'remove',
      'reverse',
      'screenshot',
      'search',
      'share',
      'show',
      'sound-audible',
      'sound-mute',
      'stack-cards',
      'stack',
      'stop',
      'tether',
      'track-changes',
      'undo',
      'zoom-in',
      'zoom-out',
      'zoom-to',
    ],
  },
  symbols: {
    description: 'These icons mainly represent an object or concept.',
    icons: [
      'air-track-history',
      'airspaces',
      'appearance',
      'arrow',
      'ascending',
      'assignment',
      'attributes',
      'bolt-not-visible',
      'bolt',
      'brightness',
      'bug-report',
      'calendar',
      'chart-stacked-bar',
      'circle-tool',
      'color-picker',
      'common-operating-pic',
      'contrast',
      'cop-settings',
      'coverage',
      'dashboard',
      'data',
      'descending',
      'electromagnetic-spectrum',
      'ellipse-tool',
      'feed',
      'flight-plan',
      'gantt',
      'grid',
      'hamburger',
      'handover',
      'handshake',
      'help',
      'hold',
      'intercept-point',
      'kebab',
      'layer-group',
      'layers',
      'line-tool',
      'location-fill',
      'location-stroke',
      'mercator-projection',
      'message',
      'mode',
      'newspaper',
      'non-editable',
      'none',
      'note',
      'overlays',
      'panel-closed',
      'panel-open',
      'person',
      'phone',
      'placeholder',
      'plots',
      'polygon-tool',
      'radar',
      'radio',
      'rectangle-tool',
      'region',
      'sector',
      'selection-list',
      'sensor-health',
      'settings',
      'spotlight',
      'threat-assess',
      'ticket',
      'time',
      'timer',
      'track-history',
      'unscheduled-maintenance',
      'user-manual',
      'watch-tower',
      'wheel',
      'wind',
    ],
  },
  'map dynamic': {
    description: 'Icons that could represent entities on a map.',
    icons: [
      'artillery',
      'commercial-ship',
      'common-air-track',
      'common-track',
      'comms',
      'convoy',
      'helicopter',
      'humvee',
      'jltv',
      'large-jet',
      'm198',
      'm777',
      'military-vessel',
      'missile',
      'missiles',
      'mobile-radar',
      'mrap',
      'patriot',
      'personal-boat',
      'prop',
      'sam-launcher',
      'shorad',
      'small-jet',
      'sm2',
      'sm3',
      'sm6',
      'tbm-launcher',
      'thaad',
      'uas',
    ],
  },
  'map static': {
    description: 'Icons that could represent entities on a map.',
    icons: [
      'aegis-ashore',
      'airport',
      'alert-base',
      'alert',
      'artcc',
      'bad-data',
      'battle-station',
      'birds',
      'building',
      'car',
      'chevron-down',
      'chevron-up',
      'connecting-airports',
      'defended-point-caal-dal',
      'label',
      'land',
      'landmine',
      'map-pin',
      'marker',
      'military-airfield',
      'minus',
      'mission',
      'person',
      'plus',
      'point-fill',
      'point-outline',
      'presumed-target',
      'radar-anomaly',
      'radar-site',
      'remote',
      'skull',
      'slash',
      'square-fill',
      'square-outline',
      'stadium',
      'star',
      'target',
      'terrain',
      'track-eta-endpoint',
      'triangle-fill',
      'triangle-outline',
      'uas-home-point',
      'waffle',
      'weather',
    ],
  },
  controls: {
    description: 'These icons portray acts or symbols related to control or configuration.',
    icons: [
      'arrow-down',
      'arrow-left',
      'arrow-northeast',
      'arrow-northwest',
      'arrow-right',
      'arrow-southeast',
      'arrow-southwest',
      'arrow-up',
      'arrow-keys',
      'arrow',
      'chevron-down',
      'chevron-fill-down',
      'chevron-up',
      'chevron-fill-up',
      'chevron-left',
      'chevron-fill-left',
      'chevron-right',
      'chevron-fill-right',
      'cursor-crosshair',
      'cursor-default',
      'cursor-drag',
      'track-eta',
      'keyboard',
      'mouse-left-click',
      'mouse-middle-click',
      'mouse-right-click',
      'mouse-scroll',
      'scroll-click',
    ],
  },
  feedback: {
    description: 'These icons portray communication or providing feedback to the user.',
    icons: [
      'bell',
      'information',
      'connection',
      'success',
      'connection-lost',
      'warning',
      'live',
      'problem',
      'whats-new',
    ],
  },
}

/** `add-fill` → `AddFill`. */
const pascal = (name: string) =>
  name
    .split(/[\s-]+/)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join('')

/** `map dynamic` → `Map Dynamic`. */
const title = (name: string) =>
  name
    .split(' ')
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')

const iconComponents = Icon as unknown as Record<string, Component>

const formatInput = (input: string) => input.toLocaleLowerCase().split(' ').join('-')

const meta = {
  title: 'Foundation/Icons',
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

export const UIIcons: Story = {
  render: () => ({
    components: { GsIcon, GsSearchField },
    setup() {
      const search = ref('')
      const filteredCatalog = computed(() => {
        const searchTerm = formatInput(search.value)
        return Object.entries(catalog).map(([section, { description, icons }]) => ({
          section,
          title: title(section),
          description,
          icons: icons
            .filter((name) => name.includes(searchTerm))
            .map((name) => ({
              name,
              exportName: `${pascal(name)}Icon`,
              component: iconComponents[`${pascal(name)}Icon`],
            })),
        }))
      })
      return { search, filteredCatalog }
    },
    template: `
      <div class="flex flex-col">
        <GsSearchField v-model="search" placeholder="Search icons" aria-label="Search icons" />
        <div
          v-for="{ section, title, description, icons } in filteredCatalog"
          :key="section"
          class="flex w-full flex-col gap-xl"
        >
          <h1 class="fg-primary-bold mt-xl text-header-xl">{{ title }}</h1>
          <p class="fg-primary-muted text-body-s">{{ description }}</p>
          <div
            class="fg-primary-bold grid auto-cols-max grid-cols-2 justify-center gap-l font-display text-body-xs md:grid-cols-3 lg:grid-cols-4"
          >
            <div v-for="icon in icons" :key="icon.name" class="flex items-center gap-s">
              <GsIcon class="fg-primary-bold flex-none"><component :is="icon.component" /></GsIcon>
              <div class="flex flex-col">
                <span class="flex-none">{{ icon.exportName }}</span>
                <span class="fg-info-bold">{{ icon.name }}</span>
              </div>
            </div>
          </div>
        </div>
      </div>`,
  }),
}
