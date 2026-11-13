export interface GsSliderMarker {
  value: number
  label?: string
}

/** A marker count (evenly spaced), a list of values, or markers with labels. */
export type GsSliderMarkers = number | number[] | GsSliderMarker[]

export interface GsSliderProps {
  /** Accessible label. Also shown above the slider unless `showLabel` is `false`. */
  label: string
  /** @default 0 */
  min?: number
  /** @default 100 */
  max?: number
  /** @default 1 */
  step?: number
  /** @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** `grid` places label, inputs and min/max values around the track; `stack` keeps them inline. @default 'grid' */
  layout?: 'grid' | 'stack'
  disabled?: boolean
  /** Name submitted with a form. */
  name?: string
  /** Tick marks along the track. */
  markers?: GsSliderMarkers
  /** Only allow values that sit on a marker. */
  snapToMarkers?: boolean
  /** @default true */
  showLabel?: boolean
  /** Number inputs for typing exact values. */
  showInput?: boolean
  /** Show marker labels under the track. */
  showMarkerLabels?: boolean
  /** Show the min and max values at the ends. @default true */
  showValueLabels?: boolean
}
