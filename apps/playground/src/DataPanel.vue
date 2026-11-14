<script setup lang="ts">
import {
  GsButton,
  GsClock,
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
  GsIcon,
  GsSwitch,
  GsTable,
  createTableColumnHelper,
  useDrawers,
} from '@wingbrace/glideslope'
import { LayersIcon, RadarIcon } from '@wingbrace/glideslope-icons'
import { ref } from 'vue'

interface Track {
  id: string
  callsign: string
  type: string
  altitude: number
  speed: number
}

const tracks: Track[] = [
  { id: 'raven', callsign: 'RAVEN 21', type: 'F-16C', altitude: 24000, speed: 420 },
  { id: 'viper', callsign: 'VIPER 11', type: 'F-35A', altitude: 31000, speed: 480 },
  { id: 'atlas', callsign: 'ATLAS 7', type: 'C-17', altitude: 28000, speed: 390 },
  { id: 'dustoff', callsign: 'DUSTOFF 4', type: 'UH-60', altitude: 1200, speed: 140 },
]

const column = createTableColumnHelper<Track>()
const columns = [
  column.accessor('callsign', { id: 'callsign', header: 'Callsign' }),
  column.accessor('type', { id: 'type', header: 'Type' }),
  column.accessor('altitude', {
    id: 'altitude',
    header: 'Altitude (ft)',
    cell: (info) => info.getValue().toLocaleString(),
  }),
  column.accessor('speed', { id: 'speed', header: 'Speed (kt)' }),
]

// TanStack's RowSelectionState: selected row ids map to true.
const selection = ref<Record<string, true>>({})
const airspace = ref(true)
const terrain = ref(false)

// Any code can control a drawer by id, as the Design Toolkit's drawer events did.
const drawers = useDrawers()
</script>

<template>
  <section class="flex flex-col gap-m">
    <div class="flex items-center justify-between gap-m">
      <h2 class="text-header-l">Data and layout</h2>
      <span class="text-body-s fg-primary-muted">UTC <GsClock /></span>
    </div>

    <div class="h-[420px] overflow-hidden rounded-medium outline outline-static">
      <GsDrawerLayout push="right">
        <GsDrawerLayoutMain>
          <!-- Right padding leaves room for the closed drawer's menu rail. -->
          <div class="flex h-full flex-col gap-m overflow-auto p-m pr-[48px]">
            <div class="flex items-center justify-between gap-m">
              <p class="text-body-s fg-primary-muted">
                {{ Object.keys(selection).length }} of {{ tracks.length }} tracks selected
              </p>
              <GsButton variant="outline" @click="drawers.toggle('playground-layers')">
                <GsIcon><LayersIcon /></GsIcon>Layers
              </GsButton>
            </div>
            <GsTable
              v-model:row-selection="selection"
              :columns="columns"
              :data="tracks"
              show-checkbox
              kebab-position="right"
              full-width
            />
          </div>
        </GsDrawerLayoutMain>

        <GsDrawer id="playground-drawer" placement="right" size="medium">
          <GsDrawerMenu position="start" aria-label="Map panels">
            <GsDrawerMenuItem toggle for="playground-layers" text-value="Layers">
              <GsIcon><LayersIcon /></GsIcon>
            </GsDrawerMenuItem>
            <GsDrawerMenuItem toggle for="playground-sensors" text-value="Sensors">
              <GsIcon><RadarIcon /></GsIcon>
            </GsDrawerMenuItem>
          </GsDrawerMenu>
          <GsDrawerPanel>
            <GsDrawerView id="playground-layers">
              <GsDrawerHeader>
                <GsDrawerHeaderTitle>Layers</GsDrawerHeaderTitle>
                <GsDrawerClose for="playground-layers" />
              </GsDrawerHeader>
              <GsDrawerContent class="flex flex-col gap-s">
                <GsSwitch v-model="airspace">Airspace</GsSwitch>
                <GsSwitch v-model="terrain">Terrain</GsSwitch>
              </GsDrawerContent>
            </GsDrawerView>
            <GsDrawerView id="playground-sensors">
              <GsDrawerHeader>
                <GsDrawerHeaderTitle>Sensors</GsDrawerHeaderTitle>
                <GsDrawerClose for="playground-sensors" />
              </GsDrawerHeader>
              <GsDrawerContent>Radar, ESM and EO/IR feeds.</GsDrawerContent>
            </GsDrawerView>
          </GsDrawerPanel>
        </GsDrawer>
      </GsDrawerLayout>
    </div>
  </section>
</template>
