<script setup lang="ts">
/**
 * Picks a color from a set of swatches, with optional "no color" and custom color options. Bind
 * the color with `v-model`; it is a hex string, or `undefined` for no color.
 *
 * Swatches are a Reka UI `ColorSwatchPicker`, navigable with the arrow keys.
 *
 * @example
 * ```vue
 * <GsColorPicker
 *   v-model="trackColor"
 *   label="Track color"
 *   :items="['#1484f4', '#0e8f37', '#ffad38', [255, 0, 51, 255]]"
 *   allow-empty
 *   show-custom-picker
 * />
 * ```
 */
import NoneIcon from '@wingbrace/glideslope-icons/none'
import { ColorSwatchPickerItem, ColorSwatchPickerItemSwatch, ColorSwatchPickerRoot } from 'reka-ui'
import { computed, ref, useId, watch } from 'vue'
import GsToggleButton from '../button/GsToggleButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import labelStyles from '../label/styles.module.css'
import { toHex } from './colors'
import GsCustomColorPicker from './GsCustomColorPicker.vue'
import styles from './styles.module.css'
import type { GsColorPickerProps } from './types'

const {
  items,
  label,
  required = false,
  disabled = false,
  allowEmpty = false,
  showCustomPicker = false,
} = defineProps<GsColorPickerProps>()

/** The selected color as a hex string, or `undefined` for no color. */
const model = defineModel<string | undefined>()

const labelId = useId()
const swatches = computed(() => [...new Set(items.map(toHex))])
const selectedHex = computed(() => (model.value ? toHex(model.value) : undefined))
const isCustom = computed(
  () => selectedHex.value !== undefined && !swatches.value.includes(selectedHex.value),
)

/** Swatch selection. Choosing the selected swatch again only clears it when `allowEmpty`. */
const swatchValue = computed({
  get: () => (isCustom.value ? undefined : selectedHex.value),
  set: (next: string | string[] | undefined) => {
    const hex = Array.isArray(next) ? next[0] : next
    if (hex !== undefined || allowEmpty) model.value = hex
  },
})

/** The last custom color, so reopening the custom picker continues where it left off. */
const customColor = ref(selectedHex.value ?? swatches.value[0] ?? '#ffffff')
watch(selectedHex, (hex) => {
  if (hex && isCustom.value) customColor.value = hex
})

function selectCustom(hex: string) {
  customColor.value = hex
  model.value = hex
}
</script>

<template>
  <div
    :class="styles.container"
    role="group"
    :aria-labelledby="label ? labelId : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <span v-if="label" :id="labelId" :class="labelStyles.label">
      {{ label }}<template v-if="!required"> (optional)</template>
    </span>
    <div :class="styles.row">
      <ColorSwatchPickerRoot
        v-model="swatchValue"
        :disabled="disabled"
        :aria-labelledby="label ? labelId : undefined"
        :class="styles.picker"
      >
        <ColorSwatchPickerItem v-for="hex in swatches" :key="hex" :value="hex" :class="styles.item">
          <ColorSwatchPickerItemSwatch :class="styles.swatch" />
        </ColorSwatchPickerItem>
      </ColorSwatchPickerRoot>

      <GsToggleButton
        v-if="allowEmpty"
        variant="icon"
        size="xsmall"
        aria-label="No color"
        :model-value="model === undefined"
        :disabled="disabled"
        :class="styles.customTrigger"
        @update:model-value="model = undefined"
      >
        <GsIcon><NoneIcon /></GsIcon>
      </GsToggleButton>

      <GsCustomColorPicker
        v-if="showCustomPicker"
        :model-value="customColor"
        :active="isCustom"
        :disabled="disabled"
        @update:model-value="selectCustom"
      />
    </div>
  </div>
</template>
