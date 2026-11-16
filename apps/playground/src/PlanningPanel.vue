<script setup lang="ts">
import {
  GsCoordinateField,
  GsKanban,
  GsKanbanCard,
  GsKanbanCardBody,
  GsKanbanCardHeader,
  GsKanbanCardHeaderActions,
  GsKanbanCardHeaderTitle,
  GsKanbanCardMoveMenu,
  GsKanbanColumn,
  GsKanbanColumnContainer,
  GsKanbanColumnContent,
  GsKanbanColumnHeader,
  GsKanbanColumnHeaderActions,
  GsKanbanColumnHeaderTitle,
  GsQueryBuilder,
  type Field,
  type GsCoordinateValue,
  type GsKanbanColumnData,
  type RuleGroupType,
} from '@wingbrace/glideslope'
import { ref } from 'vue'

// Coordinates are decimal degrees; the field shows and parses DD, DDM, DMS, MGRS and UTM.
const target = ref<GsCoordinateValue | null>({ lat: 38.8977, lon: -77.0365 })

const card = (id: string, columnId: string, position: number, title: string, body: string) => ({
  id,
  columnId,
  position,
  title,
  body,
})

const columns = ref<GsKanbanColumnData[]>([
  {
    id: 'planned',
    title: 'Planned',
    cards: [
      card('brief', 'planned', 0, 'Mission brief', 'Prepare the Northwind brief.'),
      card('airspace', 'planned', 1, 'Airspace request', 'File the ALTRV for the corridor.'),
    ],
  },
  {
    id: 'active',
    title: 'In progress',
    cards: [card('tanker', 'active', 0, 'Tanker plan', 'Confirm the refuelling track.')],
  },
  { id: 'done', title: 'Done', cards: [] },
])

const fields: Field[] = [
  { name: 'callsign', label: 'Callsign' },
  {
    name: 'affiliation',
    label: 'Affiliation',
    valueEditorType: 'select',
    values: [
      { name: 'friend', label: 'Friend' },
      { name: 'neutral', label: 'Neutral' },
      { name: 'hostile', label: 'Hostile' },
    ],
  },
  { name: 'altitude', label: 'Altitude (ft)', inputType: 'number' },
]

const query = ref<RuleGroupType>({
  combinator: 'and',
  rules: [{ field: 'affiliation', operator: '=', value: 'hostile' }],
})
</script>

<template>
  <section class="flex flex-col gap-m">
    <h2 class="text-header-l">Planning</h2>

    <div class="flex max-w-[360px] flex-col gap-s">
      <GsCoordinateField v-model="target" label="Target" description="Paste or type any format" />
      <p class="text-body-s fg-primary-muted">
        {{ target ? `${target.lat.toFixed(4)}, ${target.lon.toFixed(4)}` : 'No coordinate' }}
      </p>
    </div>

    <div class="flex flex-col gap-s">
      <h3 class="text-header-m">Track filter</h3>
      <GsQueryBuilder v-model:query="query" :fields="fields" />
    </div>

    <div class="h-[420px] overflow-hidden rounded-medium outline outline-static">
      <GsKanban v-model:columns="columns">
        <GsKanbanColumnContainer>
          <GsKanbanColumn v-for="column in columns" :key="column.id" :column="column">
            <GsKanbanColumnHeader>
              <GsKanbanColumnHeaderTitle>{{ column.title }}</GsKanbanColumnHeaderTitle>
              <GsKanbanColumnHeaderActions :card-count="column.cards.length" />
            </GsKanbanColumnHeader>
            <GsKanbanColumnContent :column="column">
              <GsKanbanCard v-for="item in column.cards" :key="item.id" :card="item">
                <GsKanbanCardHeader>
                  <GsKanbanCardHeaderTitle>{{ item.title }}</GsKanbanCardHeaderTitle>
                  <GsKanbanCardHeaderActions>
                    <!-- Moving without dragging, for pointer and keyboard users alike. -->
                    <GsKanbanCardMoveMenu :card="item" />
                  </GsKanbanCardHeaderActions>
                </GsKanbanCardHeader>
                <GsKanbanCardBody>{{ item.body }}</GsKanbanCardBody>
              </GsKanbanCard>
            </GsKanbanColumnContent>
          </GsKanbanColumn>
        </GsKanbanColumnContainer>
      </GsKanban>
    </div>
  </section>
</template>
