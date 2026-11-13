<script setup lang="ts">
/**
 * Picks a color from a set of swatches, with optional "no color" and custom color options. Bind
 * the color with `v-model`, or `undefined` for no color.
 *
 * Swatches and the model accept CSS color strings, RGBA tuples (0–255) and Reka UI `Color`
 * objects. The model is updated in the format of the bound value (a hex string for any color
 * string), or the one set with `format`. Swatches are a Reka UI `ColorSwatchPicker`, navigable
 * with the arrow keys.
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
import {
  ColorSwatchPickerItem,
  ColorSwatchPickerItemSwatch,
  ColorSwatchPickerRoot,
  type Color,
} from 'reka-ui'
import { computed, shallowRef, useAttrs, useId, watch } from 'vue'
import labelStyles from '../label/styles.module.css'
import { toColor, toHex, type GsColorInput } from './colors'
import GsCustomColorPicker from './GsCustomColorPicker.vue'
import GsNoColorButton from './GsNoColorButton.vue'
import styles from './styles.module.css'
import type { GsColorPickerProps } from './types'
import { useColorFormat } from './use-color-format'

const {
  items,
  label,
  required = false,
  disabled = false,
  allowEmpty = false,
  showCustomPicker = false,
  format,
  classes,
} = defineProps<GsColorPickerProps>()

/** The selected color, or `undefined` for no color. Updated in the format of the bound value. */
const model = defineModel<GsColorInput | undefined>()

const labelId = useId()

// Without a visible label, the swatch list is named by the `aria-label` / `aria-labelledby` given
// to the picker (which also names the surrounding group); otherwise the listbox has no name.
const attrs = useAttrs()
const listName = computed(() =>
  label
    ? { 'aria-labelledby': labelId }
    : {
        'aria-label': attrs['aria-label'] as string | undefined,
        'aria-labelledby': attrs['aria-labelledby'] as string | undefined,
      },
)

/** Swatch items by hex: duplicates are shown once, and a pick emits the item as given. */
const swatches = computed(() => {
  const byHex = new Map<string, GsColorInput>()
  for (const item of items) {
    const hex = toHex(item)
    if (!byHex.has(hex)) byHex.set(hex, item)
  }
  return byHex
})
const swatchHexes = computed(() => [...swatches.value.keys()])

/** The bound color, or `undefined` for no color (also for `null` and `''`). */
const selected = computed(() =>
  model.value == null || model.value === '' ? undefined : model.value,
)
const selectedHex = computed(() =>
  selected.value === undefined ? undefined : toHex(selected.value),
)
const isCustom = computed(
  () => selectedHex.value !== undefined && !swatches.value.has(selectedHex.value),
)

const output = useColorFormat(model, () => format)

/** Swatch selection. Choosing the selected swatch again only clears it when `allowEmpty`. */
const swatchValue = computed({
  get: () => (isCustom.value ? undefined : selectedHex.value),
  set: (next: string | string[] | undefined) => {
    const hex = Array.isArray(next) ? next[0] : next
    if (hex === undefined) {
      if (allowEmpty) model.value = undefined
      return
    }
    model.value = output(toColor(swatches.value.get(hex) ?? hex))
  },
})

/** The last custom color, so reopening the custom picker continues where it left off. */
const customColor = shallowRef<Color>(toColor(selected.value ?? items[0] ?? '#ecece6'))
watch(selectedHex, () => {
  if (isCustom.value && selected.value !== undefined) customColor.value = toColor(selected.value)
})

function selectCustom(color: GsColorInput) {
  customColor.value = toColor(color)
  model.value = output(customColor.value)
}
</script>

<template>
  <div
    :class="styles.container"
    role="group"
    :aria-labelledby="label ? labelId : undefined"
    :data-disabled="disabled ? '' : undefined"
  >
    <span v-if="label" :id="labelId" :class="[labelStyles.label, classes?.label]">
      {{ label }}<template v-if="!required"> (optional)</template>
    </span>
    <div :class="styles.row">
      <GsNoColorButton
        v-if="allowEmpty"
        :active="selectedHex === undefined"
        :disabled="disabled"
        @click="model = undefined"
      />

      <ColorSwatchPickerRoot
        v-model="swatchValue"
        :disabled="disabled"
        v-bind="listName"
        :class="[styles.picker, classes?.picker]"
      >
        <ColorSwatchPickerItem
          v-for="hex in swatchHexes"
          :key="hex"
          :value="hex"
          :class="[styles.item, classes?.item]"
        >
          <ColorSwatchPickerItemSwatch :class="[styles.swatch, classes?.swatch]" />
        </ColorSwatchPickerItem>
      </ColorSwatchPickerRoot>

      <GsCustomColorPicker
        v-if="showCustomPicker"
        :model-value="customColor"
        format="color"
        :active="isCustom"
        :disabled="disabled"
        @update:model-value="selectCustom"
      />
    </div>
  </div>
</template>
