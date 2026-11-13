<script setup lang="ts">
/**
 * A button that opens a full color picker in a popover: a saturation/brightness area, a hue slider
 * and RGB inputs. `GsColorPicker` uses it with `show-custom-picker`; use it on its own to build
 * your own color controls. Bind the color with `v-model`.
 *
 * The working color is kept as a Reka UI `Color` (HSB) so the hue survives when saturation or
 * brightness reaches zero. The model is updated in the format of the bound value (see `format`).
 *
 * @example
 * ```vue
 * <GsCustomColorPicker v-model="color" />
 * ```
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
  getAreaBackgroundStyle,
  parseColor,
  type Color,
} from 'reka-ui'
import { computed, shallowRef, watch } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import { toColor, toHex, type GsColorInput } from './colors'
import styles from './styles.module.css'
import type { GsCustomColorPickerProps } from './types'
import { useColorFormat } from './use-color-format'

const { active = undefined, disabled = false, format } = defineProps<GsCustomColorPickerProps>()

/** The color: a CSS color string, an RGBA tuple (0–255) or a Reka UI `Color`. */
const model = defineModel<GsColorInput>({ default: '#ecece6' })

const output = useColorFormat(model, () => format)
const color = shallowRef<Color>(toColor(model.value))

watch(model, (value) => {
  if (toHex(color.value) !== toHex(value)) color.value = toColor(value)
})

function update(next: string | Color) {
  color.value = typeof next === 'string' ? parseColor(next) : next
  model.value = output(color.value)
}

const hex = computed(() => toHex(color.value))
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
        <GsIcon :style="{ '--icon-color': hex }"><ColorPickerIcon /></GsIcon>
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
