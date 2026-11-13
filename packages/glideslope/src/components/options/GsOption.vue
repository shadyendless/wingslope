<script setup lang="ts">
/**
 * One selectable option. Works inside `GsOptions`, `GsSelectField` and `GsComboBoxField`, rendering
 * the matching Reka UI item for each.
 *
 * Give simple options a `label`. For richer content, use the default slot with `GsOptionLabel`
 * (the text a select shows once chosen), `GsOptionDescription` and `GsIcon`.
 *
 * In a `GsOptions` with `selection-mode="none"`, choosing the option emits `action` instead of
 * selecting it.
 *
 * @example
 * ```vue
 * <GsOption value="hostile" label="Hostile" color="critical" />
 *
 * <GsOption value="raven" text-value="RAVEN 21">
 *   <GsIcon><AirportIcon /></GsIcon>
 *   <GsOptionContent>
 *     <GsOptionLabel>RAVEN 21</GsOptionLabel>
 *     <GsOptionDescription>F-16C · 24,000 ft</GsOptionDescription>
 *   </GsOptionContent>
 * </GsOption>
 * ```
 */
import { ComboboxItem, ListboxItem, SelectItem } from 'reka-ui'
import { computed, onBeforeUnmount, watchEffect } from 'vue'
import { provideIconDefaults } from '../icon/defaults'
import { injectOptionsContext } from './context'
import GsOptionLabel from './GsOptionLabel.vue'
import styles from './styles.module.css'
import type { GsOptionProps } from './types'

const {
  value,
  label,
  textValue,
  disabled = false,
  color = 'info',
  classes,
} = defineProps<GsOptionProps>()

const emit = defineEmits<{
  /**
   * The option was chosen (clicked, or Enter / Space while highlighted). Only emitted in a
   * `GsOptions` with `selection-mode="none"`.
   */
  action: []
}>()

defineSlots<{
  /** Option content. Defaults to `label`. */
  default?: () => unknown
}>()

const options = injectOptionsContext()
const item = computed(() =>
  options.kind === 'registry'
    ? undefined
    : { select: SelectItem, combobox: ComboboxItem, listbox: ListboxItem }[options.kind],
)

// In the registry pass the option only reports its label (see GsOptionRegistry).
let unregister: (() => void) | undefined
watchEffect(() => {
  unregister?.()
  const text = label ?? textValue
  unregister =
    options.kind === 'registry' && text && value != null
      ? options.registerLabel?.(value, text)
      : undefined
})
onBeforeUnmount(() => unregister?.())

/** In a non-selectable list, choosing the option emits `action` instead of selecting it. */
function onSelect(event: Event) {
  if (options.selectable?.value !== false) return
  event.preventDefault()
  if (!disabled && !options.disabled?.value) emit('action')
}

provideIconDefaults(() => ({
  size: 'small',
  class: [styles.icon, classes?.icon].filter(Boolean).join(' '),
}))
</script>

<template>
  <!-- Reka's ListboxItem (and ComboboxItem, built on it) marks disabled items with a bare
       `disabled` attribute only, which isn't exposed to assistive technology. -->
  <component
    :is="item"
    v-if="item"
    :value="value"
    :text-value="options.kind === 'listbox' ? undefined : (textValue ?? label)"
    :disabled="disabled"
    :aria-disabled="disabled || undefined"
    :class="['group/options-item', styles.item]"
    :data-color="color"
    @select="onSelect"
  >
    <slot>
      <GsOptionLabel>{{ label }}</GsOptionLabel>
    </slot>
  </component>
</template>
