<script setup lang="ts">
/**
 * @internal Connects a control that has no Reka UI field support (e.g. `TimeFieldRoot`) to the
 * surrounding `FieldRoot`: the slot receives the ARIA attributes linking it to the field's label,
 * description and error, and the control is registered for validation and label-click focus.
 */
import { injectFieldRootContext } from 'reka-ui'
import { computed, onBeforeUnmount, onMounted, useTemplateRef, watch } from 'vue'

const { value = undefined } = defineProps<{
  /** The control's current value, used for validation (`required`, custom `validate`). */
  value?: unknown
}>()

defineSlots<{
  default?: (attrs: {
    id: string | undefined
    'aria-labelledby': string | undefined
    'aria-describedby': string | undefined
    'aria-invalid': true | undefined
  }) => unknown
}>()

const field = injectFieldRootContext(null)
const wrapper = useTemplateRef<HTMLElement>('wrapper')

const FOCUSABLE =
  'input, textarea, select, button, [contenteditable="true"], [tabindex]:not([tabindex="-1"])'

const attrs = computed(() => ({
  id: field?.fieldId.value,
  'aria-labelledby': field?.labelId.value,
  'aria-describedby': field?.describedBy.value,
  'aria-invalid': field?.invalid.value ? (true as const) : undefined,
}))

let unregister: (() => void) | undefined
onMounted(() => {
  unregister = field?.registerControl({
    element: () => wrapper.value?.querySelector<HTMLElement>(FOCUSABLE) ?? undefined,
    getValue: () => value,
  })
})
onBeforeUnmount(() => unregister?.())

watch(
  () => value,
  (next) => field?.handleControlInput({ value: next }),
)
</script>

<template>
  <div ref="wrapper" style="display: contents"><slot v-bind="attrs" /></div>
</template>
