<script setup lang="ts">
/**
 * A labeled input for a geographic coordinate, in decimal degrees (DD), degrees decimal minutes
 * (DDM), degrees minutes seconds (DMS), MGRS or UTM. Each part of the coordinate is its own
 * segment; focus moves on as a segment fills, and arrow keys, Home and End move between them.
 *
 * Bind `v-model` to a `{ lat, lon }` decimal-degrees value whatever the `format`: it is `null`
 * while the segments are empty, incomplete or invalid. Pasting a whole coordinate in any system
 * converts it (asking which system was meant when it's ambiguous). The format button shows the
 * value in every system, ready to copy. Validation errors are shown and emitted as `error`.
 *
 * `class` and `style` apply to the field wrapper; other attributes go to the segment group.
 * `provideCoordinateFieldDefaults()` sets defaults for every coordinate field below the calling
 * component.
 *
 * @example
 * ```vue
 * <GsCoordinateField v-model="target" label="Target" format="mgrs" required />
 * ```
 */
import CheckIcon from '@wingbrace/glideslope-icons/check'
import CopyToClipboardIcon from '@wingbrace/glideslope-icons/copy-to-clipboard'
import GlobalShareIcon from '@wingbrace/glideslope-icons/global-share'
import { computed, ref, useTemplateRef } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsDialog from '../dialog/GsDialog.vue'
import GsDialogContent from '../dialog/GsDialogContent.vue'
import GsDialogFooter from '../dialog/GsDialogFooter.vue'
import GsDialogTitle from '../dialog/GsDialogTitle.vue'
import GsFieldConnect from '../field/GsFieldConnect.vue'
import GsFieldLayout from '../field/GsFieldLayout.vue'
import GsIcon from '../icon/GsIcon.vue'
import GsPopover from '../popover/GsPopover.vue'
import GsPopoverContent from '../popover/GsPopoverContent.vue'
import GsPopoverTitle from '../popover/GsPopoverTitle.vue'
import GsRadio from '../radio/GsRadio.vue'
import GsRadioGroup from '../radio/GsRadioGroup.vue'
import GsTooltip from '../tooltip/GsTooltip.vue'
import { useSplitAttrs } from '../../lib/use-split-attrs'
import { COORDINATE_FORMAT_LABELS, COORDINATE_FORMAT_NAMES, COORDINATE_SYSTEMS } from './constants'
import { getAllCoordinateFormats } from './coordinate-utils'
import { injectCoordinateFieldDefaults } from './defaults'
import GsCoordinateSegment from './GsCoordinateSegment.vue'
import { GROUP_SEPARATOR, getSegmentLabel } from './segment-configs'
import styles from './styles.module.css'
import type {
  GsCoordinateErrorContext,
  GsCoordinateFieldProps,
  GsCoordinateSegmentConfig,
  GsCoordinateValue,
} from './types'
import { useCoordinateField } from './use-coordinate-field'
import { calculateMinControlWidth } from './width-utils'

defineOptions({ inheritAttrs: false })

const {
  label,
  description,
  errorMessage,
  size,
  invalid = false,
  disabled = undefined,
  required = undefined,
  name,
  validate,
  validationMode,
  format,
  variant,
  showFormatButton = undefined,
  formatButtonTooltip,
  readonly = undefined,
  classes,
} = defineProps<GsCoordinateFieldProps>()

const emit = defineEmits<{
  /**
   * A validation or paste error. `message` is `'Invalid coordinate value'` when the entered
   * segments don't form a valid coordinate (context: `errors`, `format`, `segments`), or
   * `'Invalid coordinate format'` when pasted text isn't a coordinate (context: `pastedText`).
   */
  error: [message: string, context?: GsCoordinateErrorContext]
}>()

/**
 * The coordinate in decimal degrees, or `null` while empty, incomplete or invalid. Without
 * `v-model`, starts at `default-value`.
 */
const model = defineModel<GsCoordinateValue | null>({
  // Vue's types don't let a default factory return `null`; at runtime it may.
  default: (props: Record<string, unknown>) => (props.defaultValue ?? null) as GsCoordinateValue,
})

defineSlots<{
  /** Icon of the format button. @default a globe (`GlobalShareIcon`) */
  icon?: () => unknown
}>()

const { rootAttrs, controlAttrs } = useSplitAttrs()

const defaults = injectCoordinateFieldDefaults()
const resolved = computed(() => ({
  format: format ?? defaults.value.format ?? 'dd',
  size: size ?? defaults.value.size ?? 'medium',
  variant: variant ?? defaults.value.variant ?? 'inline',
  showFormatButton: showFormatButton ?? defaults.value.showFormatButton ?? true,
  formatButtonTooltip:
    formatButtonTooltip ?? defaults.value.formatButtonTooltip ?? 'View/copy other formats',
  disabled: disabled ?? defaults.value.disabled ?? false,
  required: required ?? defaults.value.required ?? false,
  readonly: readonly ?? defaults.value.readonly ?? false,
  validationMode: validationMode ?? defaults.value.validationMode,
  classes: classes ?? defaults.value.classes,
}))

const control = useTemplateRef<HTMLElement>('control')

const { state, focus, paste, copy, effectiveErrorMessage } = useCoordinateField({
  value: model,
  format: () => resolved.value.format,
  container: control,
  errorMessage: () => errorMessage,
  invalid: () => invalid,
  disabled: () => resolved.value.disabled,
  onError: (message, context) => emit('error', message, context),
})

const { segmentValues, segmentConfigs, editableSegmentConfigs } = state
const { focusedSegmentIndex } = focus
const { disambiguationMatches, showDisambiguationModal, selectedDisambiguationFormat } = paste
const { copiedFormat, isFormatButtonEnabled } = copy

function onSegmentBlur(index: number) {
  focusedSegmentIndex.value = -1
  state.handleSegmentBlur(index)
  state.flushPendingValidation()
}

/** The format popover is open; its tooltip is off meanwhile. */
const popoverOpen = ref(false)

/** Every format of the value, computed while the popover is open. */
const allCoordinateFormats = computed(() =>
  popoverOpen.value ? getAllCoordinateFormats(state.currentValue.value) : null,
)

/** Keeps the outlined box one width while segments grow and shrink with their content. */
const minControlWidth = computed(() =>
  calculateMinControlWidth(
    editableSegmentConfigs.value,
    segmentConfigs.value,
    resolved.value.showFormatButton,
  ),
)

type SegmentItem =
  | { kind: 'literal'; key: string; value: string }
  | { kind: 'segment'; key: string; index: number; config: GsCoordinateSegmentConfig }

/** Segments and separators, split into latitude and longitude rows when stacked. */
const segmentGroups = computed(() => {
  const currentFormat = resolved.value.format
  const groups: SegmentItem[][] = [[]]
  let editableIndex = 0

  segmentConfigs.value.forEach((config, configIndex) => {
    if (config.value === GROUP_SEPARATOR && resolved.value.variant === 'stacked') {
      groups.push([])
      return
    }
    const group = groups[groups.length - 1]
    if (config.type === 'literal') {
      group?.push({
        kind: 'literal',
        key: `${currentFormat}-literal-${configIndex}`,
        value: config.value ?? '',
      })
    } else {
      group?.push({
        kind: 'segment',
        key: `${currentFormat}-segment-${editableIndex}`,
        index: editableIndex,
        config,
      })
      editableIndex += 1
    }
  })

  return groups
})
</script>

<template>
  <GsFieldLayout
    v-slot="{ ariaLabel }"
    v-bind="rootAttrs"
    :label="label"
    :description="description"
    :error-message="effectiveErrorMessage ?? undefined"
    :size="resolved.size"
    :invalid="invalid"
    :disabled="resolved.disabled"
    :required="resolved.required"
    :name="name"
    :validate="validate"
    :validation-mode="resolved.validationMode"
    :native-label="false"
    :classes="resolved.classes"
  >
    <GsFieldConnect v-slot="fieldAttrs" :value="model">
      <div
        ref="control"
        role="group"
        v-bind="{ ...fieldAttrs, ...controlAttrs }"
        :aria-label="ariaLabel ?? (controlAttrs['aria-label'] as string | undefined)"
        :aria-disabled="resolved.disabled ? 'true' : undefined"
        :class="[styles.control, resolved.classes?.control]"
        :style="resolved.variant === 'stacked' ? undefined : { '--min-width': minControlWidth }"
        :data-readonly="resolved.readonly ? '' : undefined"
      >
        <div
          :class="[styles.input, styles[resolved.variant], resolved.classes?.input]"
          @paste.capture="paste.handleInputPaste"
        >
          <div
            v-for="(group, groupIndex) in segmentGroups"
            :key="`${resolved.format}-group-${groupIndex}`"
            :class="[styles.segmentGroup, styles[resolved.variant]]"
          >
            <template v-for="item in group" :key="item.key">
              <span v-if="item.kind === 'literal'" :class="styles.literal" aria-hidden="true">
                {{ item.value }}
              </span>
              <GsCoordinateSegment
                v-else
                :value="segmentValues[item.index] ?? ''"
                :label="getSegmentLabel(resolved.format, item.index)"
                :segment-index="item.index"
                :placeholder="item.config.placeholder"
                :max-length="item.config.maxLength"
                :allowed-chars="item.config.allowedChars"
                :pad="item.config.pad"
                :disabled="resolved.disabled"
                :readonly="resolved.readonly"
                :required="resolved.required"
                :class="[styles.segment, resolved.classes?.segment]"
                @change="(value: string) => state.handleSegmentChange(item.index, value)"
                @focus="focusedSegmentIndex = item.index"
                @blur="onSegmentBlur(item.index)"
                @navigate="(event: KeyboardEvent) => focus.handleSegmentKeyDown(item.index, event)"
                @advance="focus.focusNextSegment(item.index)"
                @retreat="focus.focusPreviousSegment(item.index)"
              />
            </template>
          </div>
        </div>

        <GsPopover
          v-if="resolved.showFormatButton"
          v-model:open="popoverOpen"
          :classes="{ popover: styles.popover }"
        >
          <template #trigger>
            <GsTooltip :disabled="popoverOpen">
              <template #trigger>
                <GsButton
                  variant="icon"
                  size="small"
                  color="mono-bold"
                  aria-label="View coordinate in all formats"
                  :disabled="!isFormatButtonEnabled"
                  :class="[styles.formatButton, resolved.classes?.formatButton]"
                >
                  <GsIcon>
                    <slot name="icon"><GlobalShareIcon /></slot>
                  </GsIcon>
                </GsButton>
              </template>
              {{ resolved.formatButtonTooltip }}
            </GsTooltip>
          </template>
          <GsPopoverTitle :class="styles.popoverTitle">Copy Coordinates</GsPopoverTitle>
          <GsPopoverContent>
            <template v-if="allCoordinateFormats">
              <div
                v-for="formatKey in COORDINATE_SYSTEMS"
                :key="formatKey"
                :class="styles.formatRow"
              >
                <div :class="styles.formatLabels">
                  <span :class="styles.formatLabel">{{ COORDINATE_FORMAT_LABELS[formatKey] }}</span>
                  <span :class="styles.formatValue" :title="allCoordinateFormats[formatKey].value">
                    {{ allCoordinateFormats[formatKey].value }}
                  </span>
                </div>
                <GsButton
                  variant="icon"
                  color="mono-bold"
                  :aria-label="`Copy ${COORDINATE_FORMAT_LABELS[formatKey]} format`"
                  :disabled="!allCoordinateFormats[formatKey].isValid"
                  @click="copy.handleCopyFormat(formatKey)"
                >
                  <GsIcon>
                    <CheckIcon v-if="copiedFormat === formatKey" />
                    <CopyToClipboardIcon v-else />
                  </GsIcon>
                </GsButton>
              </div>
            </template>
          </GsPopoverContent>
        </GsPopover>
      </div>
    </GsFieldConnect>

    <GsDialog v-model:open="showDisambiguationModal">
      <GsDialogTitle :class="styles.modalTitle">Select Coordinate Format</GsDialogTitle>
      <GsDialogContent>
        <p :class="styles.modalDescription">
          The pasted value matches multiple coordinate formats. Please select the correct
          interpretation:
        </p>
        <GsRadioGroup
          v-model="selectedDisambiguationFormat"
          aria-label="Coordinate format"
          :class="styles.formatOptions"
        >
          <GsRadio v-for="match in disambiguationMatches" :key="match.format" :value="match.format">
            <span :class="styles.formatOptionContent">
              <span :class="styles.formatOptionLabel">{{
                COORDINATE_FORMAT_NAMES[match.format]
              }}</span>
              <span :class="styles.formatOptionValue">{{ match.displayString }}</span>
            </span>
          </GsRadio>
        </GsRadioGroup>
      </GsDialogContent>
      <GsDialogFooter :class="styles.modalActions">
        <GsButton variant="flat" @click="showDisambiguationModal = false">Cancel</GsButton>
        <GsButton @click="paste.handleDisambiguationSelect">Apply Selected</GsButton>
      </GsDialogFooter>
    </GsDialog>
  </GsFieldLayout>
</template>
