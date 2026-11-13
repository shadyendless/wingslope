<script setup lang="ts">
/**
 * @internal The custom color button and popover used by `GsColorPicker`: a saturation/brightness
 * area, a hue slider and RGB inputs.
 *
 * The working color is kept as a Reka UI `Color` (HSB) so the hue survives when saturation or
 * brightness reaches zero; the model receives hex strings.
 */
import ColorPickerIcon from '@wingbrace/glideslope-icons/color-picker'
import {
  ColorAreaArea,
  ColorAreaRoot,
  ColorAreaThumb,
  ColorFieldInput,
  ColorFieldRoot,
  ColorSliderRoot,
  ColorSliderThumb,
  ColorSliderTrack,
  PopoverContent,
  PopoverPortal,
  PopoverRoot,
  PopoverTrigger,
  colorToHex,
  getAreaBackgroundStyle,
  parseColor,
  type Color,
} from 'reka-ui'
import { computed, shallowRef, watch } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import styles from './styles.module.css'

const { active = false, disabled = false } = defineProps<{
  /** The current selection is a custom color. */
  active?: boolean
  disabled?: boolean
}>()

/** The custom color as a hex string. */
const model = defineModel<string>({ required: true })

const color = shallowRef<Color>(parseColor(model.value))

watch(model, (hex) => {
  if (colorToHex(color.value).toLowerCase() !== hex.toLowerCase()) color.value = parseColor(hex)
})

function update(next: string | Color) {
  color.value = typeof next === 'string' ? parseColor(next) : next
  model.value = colorToHex(color.value).toLowerCase()
}

const areaStyle = computed(() =>
  getAreaBackgroundStyle(color.value, 'saturation', 'brightness', 'hsb'),
)

const channels = [
  { channel: 'red', short: 'R' },
  { channel: 'green', short: 'G' },
  { channel: 'blue', short: 'B' },
] as const
</script>

<template>
  <PopoverRoot>
    <PopoverTrigger as-child>
      <GsButton
        variant="icon"
        size="xsmall"
        aria-label="Custom color"
        :aria-pressed="active"
        :disabled="disabled"
        :class="styles.customTrigger"
      >
        <GsIcon :style="{ '--icon-color': model }"><ColorPickerIcon /></GsIcon>
      </GsButton>
    </PopoverTrigger>
    <PopoverPortal>
      <PopoverContent side="bottom" align="start" :side-offset="4" :class="styles.popover">
        <ColorAreaRoot
          :model-value="color"
          color-space="hsb"
          x-channel="saturation"
          y-channel="brightness"
          :class="styles.area"
          @update:model-value="update"
        >
          <ColorAreaArea :class="styles.areaSurface" :style="areaStyle">
            <ColorAreaThumb :class="styles.thumb" />
          </ColorAreaArea>
        </ColorAreaRoot>

        <ColorSliderRoot
          :model-value="color"
          color-space="hsb"
          channel="hue"
          :class="styles.hue"
          @update:model-value="update"
        >
          <ColorSliderTrack :class="styles.hueTrack">
            <ColorSliderThumb :class="styles.thumb" />
          </ColorSliderTrack>
        </ColorSliderRoot>

        <div :class="styles.rgb">
          <label v-for="{ channel, short } in channels" :key="channel" :class="styles.rgbField">
            <span :class="styles.rgbLabel" aria-hidden="true">{{ short }}</span>
            <ColorFieldRoot
              :model-value="color"
              color-space="rgb"
              :channel="channel"
              @update:model-value="(next) => next && update(next)"
            >
              <ColorFieldInput :class="styles.rgbInput" :aria-label="channel" />
            </ColorFieldRoot>
          </label>
        </div>
      </PopoverContent>
    </PopoverPortal>
  </PopoverRoot>
</template>
