<script setup lang="ts">
import { Time, parseDate, type DateValue } from '@internationalized/date'
import {
  GsCheckbox,
  GsCheckboxGroup,
  GsChipList,
  GsColorPicker,
  GsComboBoxField,
  GsDateField,
  GsDeletableChip,
  GsOption,
  GsRadio,
  GsRadioGroup,
  GsSearchField,
  GsSelectField,
  GsSelectableChip,
  GsSlider,
  GsSwitch,
  GsTextAreaField,
  GsTextField,
  GsTimeField,
} from '@wingbrace/glideslope'
import { computed, reactive, shallowRef } from 'vue'

const form = reactive({
  callsign: 'RAVEN 21',
  notes: '',
  affiliation: 'friend',
  destination: 'KDEN',
  layers: ['tracks'] as string[],
  units: 'metric',
  liveUpdates: true,
  altitude: [8000, 24000] as number | number[],
  domains: ['air'] as string[],
  color: '#1484f4',
  search: '',
})
const departure = shallowRef<DateValue | null>(parseDate('2026-11-13'))
const eta = shallowRef<Time | null>(new Time(14, 30))
const assignees = reactive(['Jo Rivera', 'Sam Chen'])

function removeAssignees(values: unknown[]) {
  for (const value of values) assignees.splice(assignees.indexOf(String(value)), 1)
}

const summary = computed(() =>
  JSON.stringify(
    { ...form, departure: departure.value?.toString(), eta: eta.value?.toString(), assignees },
    null,
    2,
  ),
)
</script>

<template>
  <section class="flex flex-col gap-m">
    <h2 class="text-header-l">Forms</h2>
    <div class="grid grid-cols-2 gap-xl">
      <div class="flex flex-col gap-l">
        <GsSearchField
          v-model="form.search"
          aria-label="Search tracks"
          placeholder="Search tracks"
        />
        <GsTextField
          v-model="form.callsign"
          label="Callsign"
          description="As filed in the flight plan"
          required
        />
        <GsSelectField v-model="form.affiliation" label="Affiliation" placeholder="Choose one">
          <GsOption value="friend" label="Friend" />
          <GsOption value="neutral" label="Neutral" />
          <GsOption value="hostile" label="Hostile" color="critical" />
        </GsSelectField>
        <GsComboBoxField
          v-model="form.destination"
          label="Destination"
          placeholder="Search airports"
        >
          <GsOption value="KDEN" label="Denver International" />
          <GsOption value="KSEA" label="Seattle-Tacoma International" />
          <GsOption value="KSFO" label="San Francisco International" />
        </GsComboBoxField>
        <div class="flex gap-l">
          <GsDateField v-model="departure" label="Departure" />
          <GsTimeField v-model="eta" label="ETA" :hour-cycle="24" />
        </div>
        <GsTextAreaField v-model="form.notes" label="Notes" :rows="3" />
      </div>

      <div class="flex flex-col gap-l">
        <GsCheckboxGroup v-model="form.layers" label="Map layers" orientation="horizontal">
          <GsCheckbox value="tracks">Tracks</GsCheckbox>
          <GsCheckbox value="airspace">Airspace</GsCheckbox>
          <GsCheckbox value="terrain">Terrain</GsCheckbox>
        </GsCheckboxGroup>
        <GsRadioGroup v-model="form.units" label="Units" orientation="horizontal" required>
          <GsRadio value="metric">Metric</GsRadio>
          <GsRadio value="imperial">Imperial</GsRadio>
        </GsRadioGroup>
        <GsSwitch v-model="form.liveUpdates">Live updates</GsSwitch>
        <GsSlider
          v-model="form.altitude"
          label="Altitude band"
          :min="0"
          :max="40000"
          :step="1000"
          show-input
        />
        <GsChipList v-model="form.domains" selection-mode="multiple" aria-label="Domains">
          <GsSelectableChip value="air">Air</GsSelectableChip>
          <GsSelectableChip value="sea">Sea</GsSelectableChip>
          <GsSelectableChip value="land">Land</GsSelectableChip>
        </GsChipList>
        <GsChipList aria-label="Assignees" @remove="removeAssignees">
          <GsDeletableChip v-for="name in assignees" :key="name" :value="name">
            {{ name }}
          </GsDeletableChip>
        </GsChipList>
        <GsColorPicker
          v-model="form.color"
          label="Track color"
          :items="['#1484f4', '#0e8f37', '#ffad38', [255, 0, 51, 255]]"
          allow-empty
          show-custom-picker
        />
      </div>
    </div>
    <pre class="rounded-medium bg-surface-raised p-m font-display text-body-xs fg-primary-muted">{{
      summary
    }}</pre>
  </section>
</template>
