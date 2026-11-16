import type { Meta, StoryObj } from '@storybook/vue3-vite'
import CopyToClipboardIcon from '@wingbrace/glideslope-icons/copy-to-clipboard'
import { FormRoot } from 'reka-ui'
import { defineComponent, h, ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsOption from '../options/GsOption.vue'
import GsOptionLabel from '../options/GsOptionLabel.vue'
import GsSelectField from '../select-field/GsSelectField.vue'
import GsTextAreaField from '../text-field/GsTextAreaField.vue'
import GsTextField from '../text-field/GsTextField.vue'
import { COORDINATE_SYSTEMS } from './constants'
import { provideCoordinateFieldDefaults } from './defaults'
import GsCoordinateField from './GsCoordinateField.vue'
import type { GsCoordinateErrorContext, GsCoordinateSystem, GsCoordinateValue } from './types'

/**
 * GsCoordinateField stories: the segmented input in every coordinate system (DD, DDM, DMS, MGRS,
 * UTM), keyboard navigation, validation with `@wingbrace/geo`, the `error` event, the format
 * popover with copy, and paste handling with disambiguation.
 */
const meta = {
  title: 'Components/CoordinateField',
  component: GsCoordinateField,
  parameters: {
    layout: 'centered',
    docs: {
      description: {
        component:
          'A coordinate input field supporting multiple coordinate systems (DD, DDM, DMS, MGRS, UTM) with validation, format conversion, and paste handling. Values are always in Decimal Degrees.',
      },
    },
  },
  args: {
    label: 'Coordinates',
    description: 'Enter location coordinates',
    errorMessage: '',
    format: 'dd',
    size: 'medium',
    variant: 'inline',
    disabled: false,
    invalid: false,
    readonly: false,
    required: false,
  },
  argTypes: {
    format: {
      control: 'select',
      options: [...COORDINATE_SYSTEMS],
      description: 'The coordinate system format for display and input',
      table: {
        type: { summary: 'GsCoordinateSystem' },
        defaultValue: { summary: 'dd' },
      },
    },
    size: {
      control: 'radio',
      options: ['small', 'medium'],
      description: 'The size variant of the field',
      table: {
        type: { summary: 'small | medium' },
        defaultValue: { summary: 'medium' },
      },
    },
    variant: {
      control: 'radio',
      options: ['inline', 'stacked'],
      description: 'The variant of the field',
      table: {
        type: { summary: 'inline | stacked' },
        defaultValue: { summary: 'inline' },
      },
    },
    showFormatButton: {
      control: 'boolean',
      description: 'Whether to show the format button for copying coordinates in different formats',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'true' },
      },
    },
    label: {
      control: 'text',
      description: 'Label text displayed above the field (medium size only)',
      table: {
        type: { summary: 'string' },
      },
    },
    description: {
      control: 'text',
      description: 'Helper text displayed below the field',
      table: {
        type: { summary: 'string' },
      },
    },
    errorMessage: {
      control: 'text',
      description: 'Error message to display when field is invalid',
      table: {
        type: { summary: 'string' },
      },
    },
    disabled: {
      control: 'boolean',
      description: 'Whether the field is disabled',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    required: {
      control: 'boolean',
      description: 'Whether the field is required',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    readonly: {
      control: 'boolean',
      description: 'Whether the field is read-only',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    invalid: {
      control: 'boolean',
      description: 'Whether the field is in an invalid state',
      table: {
        type: { summary: 'boolean' },
        defaultValue: { summary: 'false' },
      },
    },
    modelValue: {
      control: 'object',
      description: 'Value (`v-model`) in Decimal Degrees format { lat: number, lon: number }',
      table: {
        type: { summary: 'GsCoordinateValue | null' },
      },
    },
    defaultValue: {
      control: 'object',
      description: 'Value to start with without `v-model`, in Decimal Degrees format',
      table: {
        type: { summary: 'GsCoordinateValue' },
      },
    },
    'onUpdate:modelValue': {
      action: 'update:modelValue',
      description: 'Emitted when the coordinate value changes (DD format, or null)',
      table: {
        type: { summary: '(value: GsCoordinateValue | null) => void' },
      },
    },
  },
  render: (args) => ({
    components: { GsCoordinateField },
    setup: () => ({ args }),
    template: '<GsCoordinateField v-bind="args" />',
  }),
} satisfies Meta<typeof GsCoordinateField>

export default meta
type Story = StoryObj<typeof meta>

const newYorkCity: GsCoordinateValue = { lat: 40.7128, lon: -74.006 }

/** A panel for the values and notes shown next to a field. */
const panelClass =
  'rounded-medium bg-surface-muted p-s text-body-s fg-primary-muted outline outline-static'

/** Options of a format select. */
const formatOptions = `
  <GsOption value="dd" text-value="Decimal Degrees (DD)">
    <GsOptionLabel>Decimal Degrees (DD)</GsOptionLabel>
  </GsOption>
  <GsOption value="ddm" text-value="Degrees Decimal Minutes (DDM)">
    <GsOptionLabel>Degrees Decimal Minutes (DDM)</GsOptionLabel>
  </GsOption>
  <GsOption value="dms" text-value="Degrees Minutes Seconds (DMS)">
    <GsOptionLabel>Degrees Minutes Seconds (DMS)</GsOptionLabel>
  </GsOption>
  <GsOption value="mgrs" text-value="MGRS">
    <GsOptionLabel>MGRS</GsOptionLabel>
  </GsOption>
  <GsOption value="utm" text-value="UTM">
    <GsOptionLabel>UTM</GsOptionLabel>
  </GsOption>`

/**
 * Default story - Basic usage with Decimal Degrees format
 *
 * Demonstrates the most common use case: a simple coordinate field with label, description, and
 * DD format input.
 */
export const Default: Story = {
  args: {
    label: 'Location',
    description: 'Enter a coordinate in Decimal Degrees format',
    format: 'dd',
    size: 'medium',
    readonly: false,
  },
  parameters: {
    docs: {
      description: {
        story:
          'The default configuration provides a labeled field with DD format. This is the recommended starting point for most use cases.',
      },
    },
  },
}

/**
 * Small size variant
 * Label is hidden in small size
 */
export const SmallSize: Story = {
  args: {
    size: 'small',
  },
}

/**
 * Stacked Variant
 *
 * Demonstrates the stacked layout variant where coordinate segments are split into separate rows
 * with latitude on the first row and longitude on the second. This is useful when vertical space
 * is available and you want to clearly separate latitude and longitude components, or when
 * working with longer coordinate formats.
 */
export const StackedVariant: Story = {
  render: () => ({
    components: { GsCoordinateField },
    setup: () => ({ newYorkCity }),
    template: `
      <div class="flex flex-col gap-xl">
        <GsCoordinateField
          label="Stacked DD Format"
          description="Decimal Degrees in stacked layout"
          format="dd"
          variant="stacked"
          :default-value="newYorkCity"
        />
        <GsCoordinateField
          label="Stacked DDM Format"
          description="Degrees Decimal Minutes in stacked layout"
          format="ddm"
          variant="stacked"
          :default-value="newYorkCity"
        />
        <GsCoordinateField
          label="Stacked DMS Format"
          description="Degrees Minutes Seconds in stacked layout"
          format="dms"
          variant="stacked"
          :default-value="newYorkCity"
        />
      </div>`,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The stacked variant displays latitude and longitude on separate rows, providing better readability for longer coordinate formats and clearer separation of components. Particularly useful in narrow containers or mobile layouts.',
      },
    },
  },
  tags: ['!dev'],
}

/**
 * With Copy Button Disabled
 *
 * The copy button can be hidden by setting `show-format-button` to false. This works for both
 * medium and small sizes.
 */
export const WithoutFormatButton: Story = {
  args: {
    showFormatButton: false,
    modelValue: newYorkCity,
  },
  render: (args) => ({
    components: { GsCoordinateField },
    setup: () => ({ args }),
    template: `
      <div class="flex flex-col gap-l">
        <GsCoordinateField v-bind="args" label="Medium without copy" size="medium" />
        <GsCoordinateField v-bind="args" label="Small without copy" size="small" />
      </div>`,
  }),
}

/**
 * Decimal Degrees format (default)
 *
 * Format: [lat], [lon]
 * Example: 40.7128, -74.0060 (New York City)
 *
 * Segments:
 * - Latitude: -90 to 90 (decimal degrees)
 * - Longitude: -180 to 180 (decimal degrees)
 *
 * Total: 2 editable segments
 */
export const DecimalDegrees: Story = {
  args: {
    format: 'dd',
    description: 'Example: 40.7128, -74.0060 (New York City)',
  },
}

/**
 * Degrees Decimal Minutes format
 *
 * Format: [lat_deg]° [lat_min]' [lat_dir], [lon_deg]° [lon_min]' [lon_dir]
 * Example: 40° 42.768' N, 74° 0.360' W (New York City)
 *
 * Segments:
 * - Latitude degrees: 0-90 (whole number)
 * - Latitude minutes: 0-59.9999 (decimal allowed)
 * - Latitude direction: N or S
 * - Longitude degrees: 0-180 (whole number)
 * - Longitude minutes: 0-59.9999 (decimal allowed)
 * - Longitude direction: E or W
 *
 * Total: 6 editable segments
 */
export const DegreesDecimalMinutes: Story = {
  args: {
    format: 'ddm',
    description: "Example: 40° 42.768' N, 74° 0.360' W (New York City)",
  },
}

/**
 * Degrees Minutes Seconds format
 *
 * Format: [lat_deg]° [lat_min]' [lat_sec]" [lat_dir], [lon_deg]° [lon_min]' [lon_sec]" [lon_dir]
 * Example: 40° 42' 46.08" N, 74° 0' 21.60" W (New York City)
 *
 * Segments:
 * - Latitude degrees: 0-90 (whole number)
 * - Latitude minutes: 0-59 (whole number)
 * - Latitude seconds: 0-59.99 (decimal allowed)
 * - Latitude direction: N or S
 * - Longitude degrees: 0-180 (whole number)
 * - Longitude minutes: 0-59 (whole number)
 * - Longitude seconds: 0-59.99 (decimal allowed)
 * - Longitude direction: E or W
 *
 * Total: 8 editable segments
 */
export const DegreesMinutesSeconds: Story = {
  args: {
    format: 'dms',
    description: 'Example: 40° 42\' 46.08" N, 74° 0\' 21.60" W (New York City)',
  },
}

/**
 * MGRS (Military Grid Reference System) format
 *
 * Format: [zone][band] [grid_100km] [easting] [northing]
 * Example: 18T WL 80654 06346 (New York City)
 *
 * Segments:
 * - Zone: 1-60 (2 digits) - auto-pads single digits on blur (e.g., "6" → "06")
 * - Band: C-X, excluding I and O (1 letter) - auto-uppercases
 * - Grid 100km: 2 letters (A-Z, excluding I and O) - auto-uppercases
 * - Easting: 5 digits (can be 1-5 based on precision)
 * - Northing: 5 digits (can be 1-5 based on precision)
 *
 * Total: 5 editable segments
 *
 * Features:
 * - Typing or pasting lowercase letters auto-converts to uppercase
 * - Single-digit zone (e.g., "6") gets leading zero on blur ("06")
 * - Paste "6r yp 12345 67890" normalizes to "06R YP 12345 67890"
 */
export const MGRS: Story = {
  args: {
    format: 'mgrs',
    description: 'Example: 18T WL 80654 06346 (New York City)',
  },
}

/**
 * UTM (Universal Transverse Mercator) format
 *
 * Format: [zone][hemisphere] [easting] [northing]
 * Example: 18N 585628 4511644 (New York City)
 *
 * Segments:
 * - Zone: 1-60 (2 digits)
 * - Hemisphere: N or S (1 letter)
 * - Easting: 6-7 digits
 * - Northing: 7 digits
 *
 * Total: 4 editable segments
 */
export const UTM: Story = {
  args: {
    format: 'utm',
    description: 'Example: 18N 585628 4511644 (New York City)',
  },
}

/**
 * Field with error state
 */
export const WithError: Story = {
  args: {
    invalid: true,
    errorMessage: 'Invalid coordinate format',
    description: undefined, // Description is hidden when error is shown
  },
}

/**
 * Disabled field
 */
export const Disabled: Story = {
  args: {
    disabled: true,
    description: 'This field is disabled',
  },
}

/**
 * Required field
 */
export const Required: Story = {
  args: {
    required: true,
    description: 'This field is required',
  },
}

/**
 * Controlled component example
 * Demonstrates `v-model` with external state and validation
 */
export const Controlled: Story = {
  render: () => ({
    components: { GsCoordinateField },
    setup: () => ({ value: ref<GsCoordinateValue | null>(null), panelClass }),
    template: `
      <div class="flex flex-col gap-m">
        <GsCoordinateField
          v-model="value"
          label="Controlled Coordinates"
          description="Enter valid coordinates to see the value update"
        />
        <div :class="panelClass">
          <div class="mb-xxs font-semibold">Current Value:</div>
          <template v-if="value">
            <div>Latitude: {{ value.lat.toFixed(6) }}</div>
            <div>Longitude: {{ value.lon.toFixed(6) }}</div>
          </template>
          <div v-else>No value yet - enter coordinates to see validation in action</div>
        </div>
      </div>`,
  }),
  parameters: {
    controls: { disable: true },
  },
}

/**
 * Validation Demo
 *
 * Demonstrates real-time validation using @wingbrace/geo with the `error` event.
 *
 * Try entering invalid coordinates to see validation errors:
 * - Latitude > 90 or < -90 → "Invalid coordinate value"
 * - Longitude > 180 or < -180 → "Invalid coordinate value"
 * - Minutes > 59 (for DDM/DMS) → "Invalid coordinate value"
 * - Seconds > 59 (for DMS) → "Invalid coordinate value"
 *
 * Error handling uses the `error` event with the `invalid` / `error-message` props for
 * implementor-controlled display.
 */
export const ValidationDemo: Story = {
  render: () => ({
    components: { GsCoordinateField },
    setup: () => {
      const value = ref<GsCoordinateValue | null>(null)
      const validationError = ref('')

      function handleError(message: string, context?: GsCoordinateErrorContext) {
        validationError.value = message
        console.error('Validation error:', message, context)
      }

      function handleChange(newValue: GsCoordinateValue | null) {
        value.value = newValue
        validationError.value = ''
      }

      return { value, validationError, handleError, handleChange }
    },
    template: `
      <GsCoordinateField
        label="Test Validation"
        description="Try entering 181, 91"
        format="dd"
        :model-value="value"
        :invalid="!!validationError"
        :error-message="validationError"
        @update:model-value="handleChange"
        @error="handleError"
      />`,
  }),
  parameters: {
    controls: { disable: true },
  },
}

/**
 * Pre-filled Value Demo
 *
 * Demonstrates initializing the component with a value. The coordinate is automatically
 * converted to the display format.
 *
 * New York City coordinates: { lat: 40.7128, lon: -74.006 }
 */
export const WithInitialValue: Story = {
  render: () => ({
    components: { GsCoordinateField },
    setup: () => ({ value: ref<GsCoordinateValue | null>(newYorkCity) }),
    template: `
      <div class="flex flex-col gap-m">
        <GsCoordinateField
          v-model="value"
          label="New York City"
          description="Pre-filled with NYC coordinates"
          format="dd"
        />
        <div class="text-body-s fg-primary-muted">
          {{ value ? \`Lat: \${value.lat.toFixed(6)}, Lon: \${value.lon.toFixed(6)}\` : 'No value' }}
        </div>
      </div>`,
  }),
  parameters: {
    controls: { disable: true },
  },
}

/**
 * Format Conversion Demo
 *
 * Demonstrates automatic conversion between formats while preserving the coordinate value. The
 * internal DD value is maintained and converted to the selected display format.
 *
 * Try switching formats - the coordinate value is preserved!
 */
export const FormatConversionDemo: Story = {
  render: () => ({
    components: { GsCoordinateField, GsSelectField, GsOption, GsOptionLabel },
    setup: () => ({
      value: ref<GsCoordinateValue | null>(newYorkCity),
      format: ref<GsCoordinateSystem>('dd'),
      panelClass,
    }),
    template: `
      <div class="flex flex-col gap-m">
        <div class="flex gap-s">
          <GsSelectField v-model="format" label="Select Format" size="small">
            ${formatOptions}
          </GsSelectField>
        </div>

        <GsCoordinateField
          v-model="value"
          label="New York City Coordinates"
          description="Same coordinate displayed in different formats"
          :format="format"
        />

        <div :class="panelClass">
          <div class="mb-xxs font-semibold">Internal Value (DD):</div>
          <template v-if="value">
            <div>Latitude: {{ value.lat.toFixed(6) }}</div>
            <div>Longitude: {{ value.lon.toFixed(6) }}</div>
          </template>
          <div v-else>No value</div>
        </div>
      </div>`,
  }),
  parameters: {
    controls: { disable: true },
  },
}

/**
 * Format Popover Demo
 *
 * Demonstrates the format conversion popover that shows all coordinate formats. Click the globe
 * icon button to see the coordinate in all 5 formats. Each format has a copy button to copy the
 * value to the clipboard.
 *
 * Features:
 * - Shows current coordinate in DD, DDM, DMS, MGRS, and UTM formats
 * - Copy to clipboard functionality for each format
 * - Visual feedback when a format is copied (checkmark icon)
 * - Button disabled when no valid coordinate is entered
 *
 * Try it:
 * 1. Enter a valid coordinate (e.g., 40.7128, -74.006)
 * 2. Click the globe icon button to open the popover
 * 3. Click any copy button to copy that format to clipboard
 * 4. See the checkmark appear for 2 seconds as confirmation
 */
export const FormatPopoverDemo: Story = {
  render: () => ({
    components: { GsCoordinateField },
    setup: () => ({ value: ref<GsCoordinateValue | null>(newYorkCity), panelClass }),
    template: `
      <div class="flex flex-col gap-m">
        <GsCoordinateField
          v-model="value"
          label="Coordinate with Format Popover"
          description="Click the globe icon to see all format conversions"
          format="dd"
        />

        <div :class="panelClass">
          <div class="mb-xxs font-semibold">Instructions:</div>
          <ul class="list-inside list-disc space-y-xxs">
            <li>Click the globe icon to open the format conversion popover</li>
            <li>All 5 coordinate formats are displayed</li>
            <li>Click the copy icon next to any format to copy it</li>
            <li>The icon changes to a checkmark for 2 seconds after copying</li>
            <li>The button is disabled when no valid coordinate is entered</li>
          </ul>
        </div>
      </div>`,
  }),
  parameters: {
    controls: { disable: true },
  },
}

/**
 * Paste Handling Demo
 *
 * Demonstrates all paste-related functionality including automatic format detection, parsing,
 * conversion, disambiguation, and error handling.
 *
 * Features:
 * - Auto-detection of complete coordinates vs. single values
 * - Parsing of all 5 coordinate formats (DD, DDM, DMS, MGRS, UTM)
 * - Automatic application when only one format matches
 * - Disambiguation dialog when multiple formats match
 * - Error handling with the `error` event ("Invalid coordinate format" for paste errors)
 * - Format conversion to selected display format
 * - Implementor-controlled error display
 *
 * This story combines all paste functionality into a single interactive demo, allowing you to
 * test both successful parsing and error handling in one place.
 */
export const PasteHandling: Story = {
  render: () => ({
    components: { GsCoordinateField, GsSelectField, GsOption, GsOptionLabel },
    setup: () => {
      const value = ref<GsCoordinateValue | null>(null)
      const format = ref<GsCoordinateSystem>('dd')
      const pasteError = ref('')

      function handleChange(newValue: GsCoordinateValue | null) {
        value.value = newValue
        // Clear the paste error when a valid value is entered
        if (newValue && pasteError.value) {
          pasteError.value = ''
        }
      }

      function handleError(message: string, context?: GsCoordinateErrorContext) {
        pasteError.value = message
        console.error('Paste error:', message, context)
      }

      return { value, format, pasteError, handleChange, handleError, panelClass }
    },
    template: `
      <div class="flex max-w-2xl flex-col gap-m">
        <GsSelectField v-model="format" label="Display Format" size="small">
          ${formatOptions}
        </GsSelectField>

        <GsCoordinateField
          label="Paste Coordinates Here"
          description="Paste any coordinate format to see parsing, conversion, and error handling"
          :format="format"
          :model-value="value"
          :invalid="!!pasteError"
          :error-message="pasteError"
          @update:model-value="handleChange"
          @error="handleError"
        />

        <div :class="panelClass">
          <div class="mb-xs font-semibold">How Paste Handling Works:</div>
          <ol class="mb-m list-inside list-decimal space-y-xxs">
            <li>Click in the coordinate field above</li>
            <li>Paste one of the example coordinates below</li>
            <li>The field automatically detects and parses the format</li>
            <li>If multiple formats match, a dialog lets you choose the correct one</li>
            <li>The coordinate converts to the selected display format</li>
            <li>If parsing fails, the error event displays an error</li>
          </ol>

          <div class="mb-xs font-semibold">Valid Coordinates to Paste:</div>
          <div class="mb-m space-y-xxs rounded-medium bg-surface-default p-xs font-display text-body-xs">
            <div class="flex gap-xs">
              <span class="w-[60px] font-bold">DD:</span>
              <span>40.7128, -74.006</span>
            </div>
            <div class="flex gap-xs">
              <span class="w-[60px] font-bold">DDM:</span>
              <span>40° 42.768' N, 74° 0.360' W</span>
            </div>
            <div class="flex gap-xs">
              <span class="w-[60px] font-bold">DMS:</span>
              <span>40° 42' 46.08" N, 74° 0' 21.60" W</span>
            </div>
            <div class="flex gap-xs">
              <span class="w-[60px] font-bold">MGRS:</span>
              <span>18T WL 80654 06346</span>
            </div>
            <div class="flex gap-xs">
              <span class="w-[60px] font-bold">UTM:</span>
              <span>18N 585628 4511644</span>
            </div>
          </div>

          <div class="mb-xs font-semibold">Error Testing Examples:</div>
          <div class="space-y-xxs rounded-medium bg-surface-default p-xs font-display text-body-xs">
            <div class="flex gap-xs">
              <span class="w-[80px] font-bold">Invalid:</span>
              <span>9999, 9999</span>
            </div>
          </div>
        </div>

        <div
          v-if="pasteError"
          class="rounded-medium bg-serious-muted p-s text-body-s outline outline-serious-bold"
        >
          <div class="mb-xs font-semibold fg-serious-bold">Paste Error:</div>
          <div>{{ pasteError }}</div>
          <div class="mt-xs text-body-xs fg-primary-muted">
            The error event captured this error. Error display is controlled by the implementor.
          </div>
        </div>

        <div
          v-if="value && !pasteError"
          class="rounded-medium bg-normal-muted p-s text-body-s outline outline-normal-bold"
        >
          <div class="mb-xs font-semibold fg-normal-bold">Successfully Parsed (DD):</div>
          <div>Latitude: {{ value.lat.toFixed(6) }}°</div>
          <div>Longitude: {{ value.lon.toFixed(6) }}°</div>
        </div>
      </div>`,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Demonstration of paste handling including automatic format detection, disambiguation, format conversion, and error handling with the `error` event. Test both successful parsing and error cases in a single interactive demo.',
      },
    },
  },
}

/**
 * All Coordinate Formats - Side-by-side comparison
 *
 * Shows all 5 supported coordinate systems displaying the same location (New York City) to
 * illustrate how different formats represent the same point.
 *
 * This story helps users understand:
 * - The visual differences between formats
 * - Segment count and structure variations
 * - How the same coordinate looks in each system
 */
export const AllFormats: Story = {
  render: () => ({
    components: { GsCoordinateField },
    setup: () => ({ newYorkCity }),
    template: `
      <div class="flex w-[600px] flex-col gap-xl">
        <GsCoordinateField
          label="Decimal Degrees (DD)"
          description="Format: lat, lon - Example: 40.7128, -74.0060"
          format="dd"
          :default-value="newYorkCity"
        />
        <GsCoordinateField
          label="Degrees Decimal Minutes (DDM)"
          description="Format: deg° min' dir - Example: 40° 42.768' N, 74° 0.360' W"
          format="ddm"
          :default-value="newYorkCity"
        />
        <GsCoordinateField
          label="Degrees Minutes Seconds (DMS)"
          description="Format: deg° min' sec&quot; dir - Example: 40° 42' 46.08&quot; N"
          format="dms"
          :default-value="newYorkCity"
        />
        <GsCoordinateField
          label="Military Grid Reference System (MGRS)"
          description="Format: zone band grid easting northing - Example: 18T WL 80654 06346"
          format="mgrs"
          :default-value="newYorkCity"
        />
        <GsCoordinateField
          label="Universal Transverse Mercator (UTM)"
          description="Format: zone hemisphere easting northing - Example: 18N 585628 4511644"
          format="utm"
          :default-value="newYorkCity"
        />
      </div>`,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Compare all coordinate formats side-by-side. All fields show New York City coordinates (40.7128, -74.006) in their respective formats.',
      },
    },
  },
}

/**
 * Accessibility Demo - Keyboard navigation and screen reader support
 *
 * Demonstrates the keyboard accessibility features:
 * - Tab / Shift+Tab: Navigate between segments
 * - Arrow Left/Right: Move between segments at boundaries
 * - Home: Jump to first segment
 * - End: Jump to last segment
 * - Backspace: Delete character or jump to previous segment when empty
 * - Auto-advance: Automatically move to next segment when current is full
 *
 * The component includes ARIA labels, descriptions, and error announcements for screen reader
 * users.
 */
export const AccessibilityDemo: Story = {
  render: () => ({
    components: { GsCoordinateField },
    template: `
      <div class="flex max-w-2xl flex-col gap-m">
        <GsCoordinateField
          label="Try Keyboard Navigation"
          description="Use the keyboard shortcuts below to navigate between segments"
          format="dd"
          size="medium"
        />
        <div class="rounded-medium bg-surface-muted p-m outline outline-static">
          <h3 class="mt-0 mb-m text-header-s font-semibold fg-primary-bold">Keyboard Navigation</h3>
          <div class="flex flex-col gap-xs text-body-s">
            <div>Tab: to next segment</div>
            <div>Shift+Tab: to previous segment</div>
            <div>Arrow Left/Right: Move between segments at field boundaries</div>
            <div>Home: Jump to first segment</div>
            <div>End: Jump to last segment</div>
            <div>Backspace: Delete character or jump to previous segment when empty</div>
          </div>
        </div>
      </div>`,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The CoordinateField is fully keyboard accessible with intuitive navigation between segments. ARIA labels and descriptions ensure screen reader compatibility.',
      },
    },
  },
}

/**
 * Custom Icon - Using different icons for the format button
 *
 * Demonstrates how to customize the format button icon. The `icon` slot accepts any icon from
 * `@wingbrace/glideslope-icons` or custom elements.
 */
export const CustomIcon: Story = {
  render: () => ({
    components: { GsCoordinateField, CopyToClipboardIcon },
    setup: () => ({ newYorkCity }),
    template: `
      <div class="flex w-[500px] flex-col gap-xl">
        <GsCoordinateField
          label="Default Icon (GlobalShare)"
          description="Uses the default GlobalShare icon"
          format="dd"
          :default-value="newYorkCity"
        />
        <GsCoordinateField
          label="Custom Icon (CopyToClipboard)"
          description="Uses the CopyToClipboard icon"
          format="dd"
          :default-value="newYorkCity"
        >
          <template #icon><CopyToClipboardIcon /></template>
        </GsCoordinateField>
      </div>`,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'The `icon` slot allows customization of the format button icon. Use any icon from `@wingbrace/glideslope-icons` or your own SVG.',
      },
    },
  },
}

/**
 * Form Integration - Complete form example
 *
 * Demonstrates integration with a form (Reka UI's `FormRoot`), including:
 * - Form submission handling
 * - Validation on submit
 * - Combining with other form fields
 * - Required field validation
 */
export const FormIntegration: Story = {
  render: () => ({
    components: { FormRoot, GsButton, GsCoordinateField, GsTextAreaField, GsTextField },
    setup: () => {
      const locationName = ref('')
      const notes = ref('')
      const coordinates = ref<GsCoordinateValue | null>(null)
      const submitted = ref<Record<string, unknown> | null>(null)

      const requireCoordinate = (value: unknown) =>
        value ? undefined : 'Enter the coordinates for this location'

      return { locationName, notes, coordinates, submitted, requireCoordinate }
    },
    template: `
      <div class="max-w-[500px]">
        <FormRoot class="flex flex-col gap-[20px]" @form-submit="(values) => (submitted = values)">
          <GsTextField v-model="locationName" name="locationName" label="Location Name" required />

          <GsCoordinateField
            v-model="coordinates"
            name="coordinates"
            label="Location Coordinates"
            description="Enter the coordinates for this location"
            format="dd"
            required
            :validate="requireCoordinate"
          />

          <GsTextAreaField v-model="notes" name="notes" label="Notes" />

          <GsButton type="submit">Submit Form</GsButton>
        </FormRoot>

        <div
          v-if="submitted"
          class="mt-l rounded-medium bg-normal-muted p-m text-body-s outline outline-normal-bold"
        >
          <strong>Form Submitted!</strong>
          <pre class="mt-xs text-body-xs">{{ JSON.stringify(submitted, null, 2) }}</pre>
        </div>
      </div>`,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Example of CoordinateField integrated in a form with other inputs. Values are in DD format for easy storage and processing.',
      },
    },
  },
}

/**
 * Real World Locations - Pre-filled examples
 *
 * Demonstrates the field with real-world coordinates from famous locations. Useful for testing
 * and showing how different locations look in different formats.
 */
export const RealWorldLocations: Story = {
  render: () => ({
    components: { GsCoordinateField },
    setup: () => ({
      locations: {
        nyc: { lat: 40.7128, lon: -74.006 },
        london: { lat: 51.5074, lon: -0.1278 },
        tokyo: { lat: 35.6762, lon: 139.6503 },
        sydney: { lat: -33.8688, lon: 151.2093 },
        paris: { lat: 48.8566, lon: 2.3522 },
      },
    }),
    template: `
      <div class="flex max-w-[500px] flex-col gap-xl">
        <GsCoordinateField
          label="New York City, USA"
          description="Times Square area"
          format="dd"
          :default-value="locations.nyc"
        />
        <GsCoordinateField
          label="London, United Kingdom"
          description="Near Westminster"
          format="ddm"
          :default-value="locations.london"
        />
        <GsCoordinateField
          label="Tokyo, Japan"
          description="Shibuya district"
          format="dms"
          :default-value="locations.tokyo"
        />
        <GsCoordinateField
          label="Sydney, Australia"
          description="Opera House area"
          format="utm"
          :default-value="locations.sydney"
        />
        <GsCoordinateField
          label="Paris, France"
          description="Eiffel Tower vicinity"
          format="mgrs"
          :default-value="locations.paris"
        />
      </div>`,
  }),
  parameters: {
    controls: { disable: true },
    docs: {
      description: {
        story:
          'Real-world coordinates from major cities, each shown in a different format. Notice how southern hemisphere coordinates (Sydney) use negative latitude.',
      },
    },
  },
}

export const Readonly: Story = {
  args: {
    readonly: true,
    modelValue: { lat: 23.2425, lon: 12.16112 },
  },
}

/** Glideslope extra: `provideCoordinateFieldDefaults()` sets the format and size of every field below it. */
export const SharedDefaults: Story = {
  render: () => ({
    components: {
      DefaultsProvider: defineComponent({
        setup(_, { slots }) {
          provideCoordinateFieldDefaults({ format: 'dms', size: 'small' })
          return () => h('div', { class: 'flex flex-col gap-m' }, slots.default?.())
        },
      }),
      GsCoordinateField,
    },
    template: `
      <DefaultsProvider>
        <GsCoordinateField label="Start" />
        <GsCoordinateField label="End" />
        <GsCoordinateField label="Waypoint (format set on the field)" format="mgrs" />
      </DefaultsProvider>`,
  }),
  parameters: {
    controls: { disable: true },
  },
}
