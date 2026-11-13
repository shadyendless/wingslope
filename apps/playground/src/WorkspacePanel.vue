<script setup lang="ts">
import {
  GsAccordion,
  GsAccordionGroup,
  GsAccordionHeader,
  GsAccordionPanel,
  GsAccordionTrigger,
  GsActionBar,
  GsBreadcrumbItem,
  GsBreadcrumbs,
  GsButton,
  GsDialog,
  GsDialogClose,
  GsDialogContent,
  GsDialogFooter,
  GsDialogTitle,
  GsIcon,
  GsList,
  GsListItem,
  GsListItemContent,
  GsListItemDescription,
  GsListItemTitle,
  GsMenu,
  GsMenuCheckboxItem,
  GsMenuItem,
  GsMenuSeparator,
  GsPagination,
  GsPopover,
  GsPopoverClose,
  GsPopoverContent,
  GsPopoverFooter,
  GsPopoverTitle,
  GsStepper,
  GsStepperList,
  GsStepperPanel,
  GsStepperStep,
  GsSwitch,
  GsTab,
  GsTabList,
  GsTabPanel,
  GsTabs,
  GsTextField,
  GsToggleButton,
  GsTooltip,
  useNotices,
} from '@wingbrace/glideslope'
import {
  DeleteIcon,
  EditIcon,
  FilterIcon,
  KebabIcon,
  LargeJetIcon,
  LayersIcon,
  SearchIcon,
  ZoomInIcon,
  ZoomOutIcon,
} from '@wingbrace/glideslope-icons'
import { computed, ref } from 'vue'

interface Track {
  id: string
  callsign: string
  detail: string
}

const { queue } = useNotices()

const tracks = ref<Track[]>([
  { id: 'raven', callsign: 'RAVEN 21', detail: 'F-16C · 24,000 ft' },
  { id: 'viper', callsign: 'VIPER 11', detail: 'F-35A · 31,000 ft' },
  { id: 'atlas', callsign: 'ATLAS 7', detail: 'C-17 · 28,000 ft' },
])
const selected = ref<string[]>([])
const tab = ref('tracks')
const page = ref(1)
const filtering = ref(false)
const layers = ref(true)
const showLabels = ref(true)
const openLayers = ref<string | string[]>(['airspace'])

const pendingDelete = ref<Track>()
const deleteOpen = computed({
  get: () => pendingDelete.value !== undefined,
  set: (open) => {
    if (!open) pendingDelete.value = undefined
  },
})

function confirmDelete() {
  const track = pendingDelete.value
  if (!track) return
  tracks.value = tracks.value.filter((t) => t.id !== track.id)
  selected.value = selected.value.filter((id) => id !== track.id)
  pendingDelete.value = undefined
  queue({
    message: `${track.callsign} deleted`,
    color: 'normal',
    timeout: 5000,
    closeOnAction: true,
    primary: {
      label: 'Undo',
      onAction: () => (tracks.value = [...tracks.value, track]),
    },
  })
}

// The stepper is unstyled; draw its steps as bars, like the Design Toolkit's stories.
const stepBar =
  'h-[3px] w-full bg-surface-muted transition-colors data-current:bg-accent-primary-bold data-visited:bg-accent-primary-muted'
const step = ref<'details' | 'review'>('details')
const missionName = ref('')
const missionOpen = ref(false)

function createMission(close: () => void) {
  queue({ message: `Mission ${missionName.value || 'Untitled'} created`, color: 'info' })
  missionName.value = ''
  step.value = 'details'
  close()
}
</script>

<template>
  <section class="flex flex-col gap-m">
    <h2 class="text-header-l">Workspace</h2>

    <GsBreadcrumbs>
      <GsBreadcrumbItem href="#missions">Missions</GsBreadcrumbItem>
      <GsBreadcrumbItem href="#northwind">Operation Northwind</GsBreadcrumbItem>
      <GsBreadcrumbItem current>Tracks</GsBreadcrumbItem>
    </GsBreadcrumbs>

    <div class="flex flex-wrap items-start gap-l">
      <GsActionBar aria-label="Map tools" elevation="raised">
        <GsTooltip>
          <template #trigger>
            <GsButton aria-label="Search"
              ><GsIcon><SearchIcon /></GsIcon
            ></GsButton>
          </template>
          Search tracks
        </GsTooltip>
        <GsTooltip>
          <template #trigger>
            <GsToggleButton v-model="filtering" aria-label="Filter">
              <GsIcon><FilterIcon /></GsIcon>
            </GsToggleButton>
          </template>
          {{ filtering ? 'Hide filters' : 'Show filters' }}
        </GsTooltip>
        <GsToggleButton v-model="layers" aria-label="Layers">
          <GsIcon><LayersIcon /></GsIcon>
        </GsToggleButton>
        <GsButton aria-label="Zoom in"
          ><GsIcon><ZoomInIcon /></GsIcon
        ></GsButton>
        <GsButton aria-label="Zoom out"
          ><GsIcon><ZoomOutIcon /></GsIcon
        ></GsButton>
      </GsActionBar>

      <GsDialog v-model:open="missionOpen" size="large">
        <template #trigger><GsButton color="accent">New mission</GsButton></template>
        <template #default="{ close }">
          <GsDialogTitle>New mission</GsDialogTitle>
          <GsDialogContent>
            <GsStepper v-model="step">
              <GsStepperList aria-label="New mission steps" class="mb-l flex gap-m">
                <GsStepperStep value="details" :class="stepBar" />
                <GsStepperStep value="review" :class="stepBar" />
              </GsStepperList>
              <GsStepperPanel value="details">
                <GsTextField v-model="missionName" label="Mission name" placeholder="Northwind" />
              </GsStepperPanel>
              <GsStepperPanel value="review">
                Create {{ missionName || 'Untitled' }} with {{ selected.length }} selected track(s)?
              </GsStepperPanel>
            </GsStepper>
          </GsDialogContent>
          <GsDialogFooter>
            <GsDialogClose><GsButton variant="flat">Cancel</GsButton></GsDialogClose>
            <GsButton v-if="step === 'review'" @click="step = 'details'">Back</GsButton>
            <GsButton v-if="step === 'details'" color="accent" @click="step = 'review'"
              >Next</GsButton
            >
            <GsButton v-else color="accent" @click="createMission(close)">Create</GsButton>
          </GsDialogFooter>
        </template>
      </GsDialog>
    </div>

    <GsTabs v-model="tab">
      <GsTabList aria-label="Workspace views">
        <GsTab value="tracks">Tracks</GsTab>
        <GsTab value="layers">Layers</GsTab>
      </GsTabList>

      <GsTabPanel value="tracks" class="flex max-w-[480px] flex-col gap-m">
        <GsList v-model="selected" selection-mode="multiple" aria-label="Tracks">
          <GsListItem
            v-for="track in tracks"
            :key="track.id"
            :value="track.id"
            :text-value="track.callsign"
          >
            <GsIcon><LargeJetIcon /></GsIcon>
            <GsListItemContent>
              <GsListItemTitle>{{ track.callsign }}</GsListItemTitle>
              <GsListItemDescription>{{ track.detail }}</GsListItemDescription>
            </GsListItemContent>
            <template #actions>
              <GsMenu>
                <template #trigger>
                  <GsButton variant="icon" :aria-label="`${track.callsign} actions`">
                    <GsIcon><KebabIcon /></GsIcon>
                  </GsButton>
                </template>
                <GsMenuItem label="Rename" hotkey="R"
                  ><GsIcon><EditIcon /></GsIcon
                ></GsMenuItem>
                <GsMenuSeparator />
                <GsMenuItem label="Delete" color="critical" @select="pendingDelete = track">
                  <GsIcon><DeleteIcon /></GsIcon>
                </GsMenuItem>
              </GsMenu>
            </template>
          </GsListItem>
        </GsList>
        <div class="flex items-center justify-between gap-m">
          <GsPopover side="top">
            <template #trigger>
              <GsButton variant="outline" :disabled="!selected.length">
                {{ selected.length }} selected
              </GsButton>
            </template>
            <GsPopoverTitle>Selection</GsPopoverTitle>
            <GsPopoverContent>
              {{
                tracks
                  .filter((t) => selected.includes(t.id))
                  .map((t) => t.callsign)
                  .join(', ')
              }}
            </GsPopoverContent>
            <GsPopoverFooter>
              <GsPopoverClose><GsButton variant="flat">Close</GsButton></GsPopoverClose>
            </GsPopoverFooter>
          </GsPopover>
          <GsPagination v-model="page" :total="8" />
        </div>
      </GsTabPanel>

      <GsTabPanel value="layers" class="max-w-[480px]">
        <GsAccordionGroup v-model="openLayers" multiple>
          <GsAccordion value="airspace">
            <GsAccordionHeader>
              <GsAccordionTrigger>Airspace</GsAccordionTrigger>
              <GsMenu>
                <template #trigger>
                  <GsButton aria-label="Airspace options"
                    ><GsIcon><KebabIcon /></GsIcon
                  ></GsButton>
                </template>
                <GsMenuCheckboxItem v-model="showLabels" label="Show labels" />
              </GsMenu>
            </GsAccordionHeader>
            <GsAccordionPanel>
              <GsSwitch v-model="showLabels">Sector labels</GsSwitch>
            </GsAccordionPanel>
          </GsAccordion>
          <GsAccordion value="terrain">
            <GsAccordionHeader>
              <GsAccordionTrigger>Terrain</GsAccordionTrigger>
            </GsAccordionHeader>
            <GsAccordionPanel>Elevation shading and contours.</GsAccordionPanel>
          </GsAccordion>
        </GsAccordionGroup>
      </GsTabPanel>
    </GsTabs>

    <GsDialog v-model:open="deleteOpen">
      <GsDialogTitle>Delete {{ pendingDelete?.callsign }}?</GsDialogTitle>
      <GsDialogContent>The track leaves the shared picture.</GsDialogContent>
      <GsDialogFooter>
        <GsDialogClose><GsButton variant="flat">Cancel</GsButton></GsDialogClose>
        <GsButton color="critical" @click="confirmDelete">Delete</GsButton>
      </GsDialogFooter>
    </GsDialog>
  </section>
</template>
