import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { PlaceholderIcon } from '@wingbrace/glideslope-icons'
import { computed } from 'vue'
import GsIcon from '../icon/GsIcon.vue'
import {
  CURRENT_TIME_MS,
  DATASET_JAN25_TO_JAN28,
  DATASET_JAN27_TO_JAN30,
  DATASET_JAN29_TO_FEB1,
} from './__fixtures__'
import { TIMESCALE_OPTIONS } from './constants'
import GsGantt from './GsGantt.vue'
import GsGanttBlock from './GsGanttBlock.vue'
import GsGanttBracketClose from './GsGanttBracketClose.vue'
import GsGanttBracketOpen from './GsGanttBracketOpen.vue'
import GsGanttContentContainer from './GsGanttContentContainer.vue'
import GsGanttContentRow from './GsGanttContentRow.vue'
import GsGanttIconMarker from './GsGanttIconMarker.vue'
import GsGanttMarker from './GsGanttMarker.vue'
import GsGanttPanelContainer from './GsGanttPanelContainer.vue'
import GsGanttPanelRow from './GsGanttPanelRow.vue'
import GsGanttSpacer from './GsGanttSpacer.vue'
import type { GsGanttMetThresholdData, GsGanttTimescale } from './types'

const datasetKeys: Record<string, typeof DATASET_JAN27_TO_JAN30> = {
  JAN25_TO_JAN28: DATASET_JAN25_TO_JAN28,
  JAN27_TO_JAN30: DATASET_JAN27_TO_JAN30,
  JAN29_TO_FEB1: DATASET_JAN29_TO_FEB1,
}

type StoryControls = {
  currentTimeMs: number
  timescale: GsGanttTimescale
  rowHeightPx: string
  datasetKey: keyof typeof datasetKeys
}

const components = {
  GsGantt,
  GsGanttBlock,
  GsGanttBracketClose,
  GsGanttBracketOpen,
  GsGanttContentContainer,
  GsGanttContentRow,
  GsGanttIconMarker,
  GsGanttMarker,
  GsGanttPanelContainer,
  GsGanttPanelRow,
  GsGanttSpacer,
  GsIcon,
  PlaceholderIcon,
}

const meta = {
  title: 'Components/Gantt',
  args: {
    currentTimeMs: CURRENT_TIME_MS,
    timescale: '1h',
    rowHeightPx: '40',
  },
  argTypes: {
    datasetKey: {
      control: 'select',
      options: Object.keys(datasetKeys),
    },
    timescale: {
      control: 'select',
      options: TIMESCALE_OPTIONS,
    },
    rowHeightPx: {
      control: 'select',
      options: ['35', '40', '60', '80'],
    },
  },
  parameters: {
    layout: 'padded',
  },
} satisfies Meta<StoryControls>

export default meta
type Story = StoryObj<StoryControls>

const twoDigits = (value: number) => value.toString().padStart(2, '0')

/** `HH:MM--HH:MM` in UTC, for the blocks' labels. */
const timestampLabel = (startTimestampMs: number, endTimestampMs: number) => {
  const start = new Date(startTimestampMs)
  const end = new Date(endTimestampMs)

  return `${twoDigits(start.getUTCHours())}:${twoDigits(start.getUTCMinutes())}--${twoDigits(end.getUTCHours())}:${twoDigits(end.getUTCMinutes())}`
}

export const DatasetDriven: Story = {
  render: (args) => ({
    components,
    setup: () => {
      const dataset = computed(() => datasetKeys[args.datasetKey]!)
      const threshold = { timescaleMultipleDistance: 3, rowIndexBoundaryDistance: 2 }
      const onThresholdMet = (metThresholds: GsGanttMetThresholdData[]) => {
        console.log(metThresholds)
      }

      return { args, dataset, threshold, onThresholdMet, timestampLabel }
    },
    template: `
      <div class="h-[480px]">
        <GsGantt
          :start-time-ms="dataset.startTimeMs"
          :end-time-ms="dataset.endTimeMs"
          :current-time-ms="args.currentTimeMs"
          :timescale="args.timescale"
          :threshold="threshold"
          :row-height-px="Number(args.rowHeightPx)"
          @threshold-met="onThresholdMet"
        >
          <GsGanttPanelContainer>
            <GsGanttPanelRow v-for="row in dataset.rows" :key="row.id">
              <div class="flex items-center font-display text-body-s fg-primary-bold">
                <span>{{ row.trackNumber }}</span>
                <span v-if="row.description" class="fg-inverse-muted">&nbsp;- {{ row.description }}</span>
              </div>
            </GsGanttPanelRow>
          </GsGanttPanelContainer>
          <GsGanttContentContainer>
            <GsGanttContentRow v-for="row in dataset.rows" :key="row.id">
              <template v-for="(element, index) in row.elements" :key="row.id + '-' + element.type + '-' + index">
                <GsGanttBlock
                  v-if="element.type === 'block'"
                  :id="row.id + '-block-' + index"
                  :start-time-ms="element.rangeMs[0]"
                  :end-time-ms="element.rangeMs[1]"
                  :color="element.color"
                >
                  <div v-if="element.color === 'critical' || element.color === 'serious'" class="flex flex-col text-body-xs">
                    <span>JAMMING ENTRY</span>
                    <span>{{ timestampLabel(element.rangeMs[0], element.rangeMs[1]) }}</span>
                  </div>
                </GsGanttBlock>
                <GsGanttSpacer
                  v-else-if="element.type === 'spacer'"
                  :id="row.id + '-spacer-' + index"
                  :start-time-ms="element.rangeMs[0]"
                  :end-time-ms="element.rangeMs[1]"
                  :color="element.color"
                />
                <GsGanttBracketClose
                  v-else-if="element.type === 'bracket-close'"
                  :time-ms="element.timeMs"
                  :color="element.color"
                />
                <GsGanttBracketOpen
                  v-else-if="element.type === 'bracket-open'"
                  :time-ms="element.timeMs"
                  :color="element.color"
                />
                <GsGanttMarker
                  v-else-if="element.type === 'marker'"
                  :time-ms="element.timeMs"
                  :color="element.color"
                />
                <GsGanttIconMarker
                  v-else-if="element.type === 'icon-marker'"
                  :time-ms="element.timeMs"
                  :color="element.color"
                >
                  <GsIcon size="small"><PlaceholderIcon /></GsIcon>
                </GsGanttIconMarker>
              </template>
            </GsGanttContentRow>
          </GsGanttContentContainer>
        </GsGantt>
      </div>
    `,
  }),
  args: {
    datasetKey: Object.keys(datasetKeys)[1] as keyof typeof datasetKeys,
    timescale: '2h',
    rowHeightPx: '40',
    currentTimeMs: CURRENT_TIME_MS,
  },
}

export const Static: Story = {
  render: () => ({
    components,
    setup: () => ({
      // Define time boundaries
      startTimeMs: 1769472000000, // Tuesday, Jan 27, 2026 at 12:00 AM UTC
      endTimeMs: 1769760000000, // Friday, Jan 30, 2026 at 8:00 AM UTC
      currentTimeMs: 1769583600000, // Wed Jan 28, 2026 at 7:00 AM UTC
    }),
    template: `
      <div class="h-[160px]">
        <GsGantt
          :start-time-ms="startTimeMs"
          :end-time-ms="endTimeMs"
          :current-time-ms="currentTimeMs"
          timescale="1h"
          :row-height-px="40"
        >
          <GsGanttPanelContainer>
            <GsGanttPanelRow>
              <span class="font-display text-body-s fg-primary-bold">KC-135</span>
              <span class="text-body-s fg-inverse-muted">&nbsp;- Aerial Refueling</span>
            </GsGanttPanelRow>
            <GsGanttPanelRow>
              <span class="font-display text-body-s fg-primary-bold">F-35</span>
              <span class="text-body-s fg-inverse-muted">&nbsp;- Early Precision</span>
            </GsGanttPanelRow>
          </GsGanttPanelContainer>

          <GsGanttContentContainer>
            <GsGanttContentRow>
              <!-- Row 1 elements -->
              <!-- Tue Jan 27, 12:30 AM to 2:00 AM -->
              <GsGanttBlock :start-time-ms="1769473800000" :end-time-ms="1769479200000" color="serious" />
              <!-- Tue Jan 27, 2:00 AM to 2:05 AM -->
              <GsGanttSpacer :start-time-ms="1769479200000" :end-time-ms="1769479500000" />
              <!-- Tue Jan 27, 2:05 AM to 2:45 AM -->
              <GsGanttBlock :start-time-ms="1769479500000" :end-time-ms="1769481900000" />
              <!-- Tue Jan 27, 4:10 AM -->
              <GsGanttMarker :time-ms="1769487000000" />
              <!-- Tue Jan 27, 4:15 AM -->
              <GsGanttBracketOpen :time-ms="1769487300000" />
              <!-- Tue Jan 27, 4:15 AM to Thu Jan 29, 12:00 PM -->
              <GsGanttSpacer :start-time-ms="1769487300000" :end-time-ms="1769695200000" color="critical" />
              <!-- Thu Jan 29, 12:00 PM -->
              <GsGanttBracketClose :time-ms="1769695200000" />
            </GsGanttContentRow>

            <GsGanttContentRow>
              <!-- Row 2 elements -->
              <!-- Tue Jan 27, 5:30 AM to 7:00 AM -->
              <GsGanttBlock :start-time-ms="1769491800000" :end-time-ms="1769497200000" color="accent" />
              <!-- Wed Jan 28, 1:45 AM -->
              <GsGanttIconMarker :time-ms="1769564000000" color="serious">
                <GsIcon size="small"><PlaceholderIcon /></GsIcon>
              </GsGanttIconMarker>
              <!-- Wed Jan 28, 11:30 PM to Thu Jan 29, 2:30 AM -->
              <GsGanttBlock :start-time-ms="1769643000000" :end-time-ms="1769653800000" color="serious">
                <div class="flex flex-col text-body-xs">
                  <span>MISSION ENTRY</span>
                  <span>11:30PM-02:30AM</span>
                </div>
              </GsGanttBlock>
            </GsGanttContentRow>
          </GsGanttContentContainer>
        </GsGantt>
      </div>
    `,
  }),
}
