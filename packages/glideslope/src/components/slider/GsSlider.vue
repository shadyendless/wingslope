<script setup lang="ts">
/**
 * Picks a number (or a range) by dragging along a track. Bind `v-model` to a number for one thumb,
 * or to `[start, end]` for a range.
 *
 * Built on Reka UI's `SliderRoot`: thumbs support arrow keys, Page Up/Down and Home/End.
 *
 * @example
 * ```vue
 * <GsSlider v-model="opacity" label="Opacity" :markers="5" show-marker-labels />
 * <GsSlider v-model="altitudes" label="Altitude band" :min="0" :max="40000" :step="1000" show-input />
 * ```
 */
import { SliderRange, SliderRoot, SliderThumb, SliderTrack } from 'reka-ui'
import { computed, ref, useId, watch } from 'vue'
import { normalizeMarkers, parseInputValue, snapToMarker } from './markers'
import styles from './styles.module.css'
import type { GsSliderProps } from './types'

const {
  label,
  min = 0,
  max = 100,
  step = 1,
  orientation = 'horizontal',
  layout = 'grid',
  disabled = false,
  name,
  markers,
  snapToMarkers = false,
  showLabel = true,
  showInput = false,
  showMarkerLabels = false,
  showValueLabels = true,
} = defineProps<GsSliderProps>()

const emit = defineEmits<{
  /** The user finished changing the value (pointer released or key handled). */
  valueCommit: [value: number | number[]]
}>()

/** The value: a number for one thumb, `[start, end]` for a range. */
const model = defineModel<number | number[]>()

const labelId = useId()
const normalizedMarkers = computed(() => normalizeMarkers(markers, min, max))
const shouldSnap = computed(() => snapToMarkers && normalizedMarkers.value.length > 0)

const isRange = computed(() => Array.isArray(model.value))
const values = computed<number[]>(() =>
  model.value === undefined ? [min] : Array.isArray(model.value) ? model.value : [model.value],
)

function snap(next: number[]) {
  return shouldSnap.value ? next.map((v) => snapToMarker(v, normalizedMarkers.value)) : next
}

function toModel(next: number[]): number | number[] {
  return isRange.value ? next : (next[0] ?? min)
}

function update(next: number[] | undefined) {
  if (next) model.value = toModel(snap(next))
}

function commit(next: number[]) {
  emit('valueCommit', toModel(snap(next)))
}

/**
 * Text currently in each number input. Kept separately from the value so typing isn't reset by
 * re-renders; it follows the value whenever the value changes.
 */
const drafts = ref<string[]>([])
watch(values, (next) => (drafts.value = next.map(String)), { immediate: true })

function setThumb(index: number) {
  const next = [...values.value]
  next[index] = parseInputValue(drafts.value[index] ?? '', min, max)
  drafts.value[index] = String(next[index])
  update(next)
  commit(next)
}

const markerPercent = (value: number) => ((value - min) / (max - min)) * 100
const hasLabeledMarkerAt = (value: number) =>
  normalizedMarkers.value.some((marker) => marker.value === value && marker.label)

const hideMinValue = computed(
  () => !showValueLabels || (showMarkerLabels && hasLabeledMarkerAt(min)),
)
const hideMaxValue = computed(
  () => !showValueLabels || (showMarkerLabels && hasLabeledMarkerAt(max)),
)

function thumbLabel(index: number) {
  if (values.value.length < 2) return label
  return `${label}, ${index === 0 ? 'minimum' : 'maximum'}`
}
</script>

<template>
  <SliderRoot
    :model-value="values"
    :min="min"
    :max="max"
    :step="step"
    :orientation="orientation"
    :disabled="disabled"
    :name="name"
    role="group"
    :aria-labelledby="showLabel ? labelId : undefined"
    :aria-label="showLabel ? undefined : label"
    :class="['group/slider', styles.slider]"
    :data-layout="layout"
    @update:model-value="update"
    @value-commit="commit"
  >
    <span v-if="showLabel" :id="labelId" :class="styles.label">{{ label }}</span>

    <div v-if="showInput" :class="styles.inputs">
      <input
        v-for="(_, index) in values"
        :key="index === 0 ? 'min' : 'max'"
        v-model="drafts[index]"
        :class="styles.input"
        :style="{ '--input-chars': String(max).length + 1 }"
        inputmode="decimal"
        :aria-label="thumbLabel(index)"
        :disabled="disabled"
        @change="setThumb(index)"
      />
    </div>

    <SliderTrack :class="styles.track">
      <div :class="styles.trackBackground" />
      <div v-if="normalizedMarkers.length" :class="styles.markers" aria-hidden="true">
        <div
          v-for="marker in normalizedMarkers"
          :key="marker.value"
          :class="styles.marker"
          :style="{ '--marker-percent': markerPercent(marker.value) }"
        >
          <div :class="styles.markerDot" />
          <span v-if="showMarkerLabels && marker.label" :class="styles.markerLabel">
            {{ marker.label }}
          </span>
        </div>
      </div>
      <SliderRange :class="styles.range" />
      <SliderThumb
        v-for="(_, index) in values"
        :key="index"
        :class="styles.thumb"
        :aria-label="thumbLabel(index)"
      />
    </SliderTrack>

    <span :class="styles.minValue" :hidden="hideMinValue" aria-hidden="true">{{ min }}</span>
    <span :class="styles.maxValue" :hidden="hideMaxValue" aria-hidden="true">{{ max }}</span>
  </SliderRoot>
</template>
