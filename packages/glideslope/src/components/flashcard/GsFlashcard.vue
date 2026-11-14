<script setup lang="ts">
/**
 * A quick visual identifier for a map entity: a header and subheader, additional data, and a short
 * list of details, with a loading state.
 *
 * The card shares `loading`, `header` and `subheader` with its parts: `GsFlashcardHero`,
 * `GsFlashcardAdditionalData`, `GsFlashcardDetailsList`, `GsFlashcardDetailsLabel` and
 * `GsFlashcardDetailsValue`.
 *
 * @example
 * ```vue
 * <GsFlashcard :loading="loading" header="RAVEN 21" subheader="F-16C">
 *   <GsFlashcardHero />
 *   <GsFlashcardAdditionalData>Last seen 14:02Z</GsFlashcardAdditionalData>
 *   <GsFlashcardDetailsList>
 *     <template v-for="detail in details" :key="detail.id">
 *       <GsFlashcardDetailsLabel>{{ detail.label }}</GsFlashcardDetailsLabel>
 *       <GsFlashcardDetailsValue>{{ detail.value }}</GsFlashcardDetailsValue>
 *     </template>
 *   </GsFlashcardDetailsList>
 * </GsFlashcard>
 * ```
 */
import { provideFlashcardContext } from './context'
import styles from './styles.module.css'
import type { GsFlashcardProps } from './types'

const { loading = false, header, subheader } = defineProps<GsFlashcardProps>()

defineSlots<{
  /** The flashcard parts. */
  default?: () => unknown
}>()

// Getters keep the parts reactive to the props.
provideFlashcardContext({
  get loading() {
    return loading
  },
  get header() {
    return header
  },
  get subheader() {
    return subheader
  },
})
</script>

<template>
  <div :class="styles.container" :data-loading="loading ? '' : undefined">
    <slot />
  </div>
</template>
