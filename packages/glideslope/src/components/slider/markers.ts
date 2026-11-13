import type { GsSliderMarker, GsSliderMarkers } from './types'

/** Turns any marker config into sorted `{ value, label }` markers. */
export function normalizeMarkers(
  config: GsSliderMarkers | undefined,
  min: number,
  max: number,
): GsSliderMarker[] {
  if (config === undefined) return []

  if (typeof config === 'number') {
    if (config < 2) return []
    const spacing = (max - min) / (config - 1)
    return Array.from({ length: config }, (_, i) => ({ value: min + spacing * i }))
  }

  return config
    .map((item) => (typeof item === 'number' ? { value: item } : item))
    .sort((a, b) => a.value - b.value)
}

/** Returns the marker value closest to `value`. Markers must be sorted. */
export function snapToMarker(value: number, markers: GsSliderMarker[]): number {
  let nearest = markers[0]?.value ?? value
  for (const marker of markers) {
    if (Math.abs(value - marker.value) < Math.abs(value - nearest)) nearest = marker.value
  }
  return nearest
}

/** Clamps a typed value into range; anything unparsable becomes `min`. */
export function parseInputValue(text: string, min: number, max: number): number {
  const parsed = Number.parseFloat(text)
  return Number.isNaN(parsed) ? min : Math.min(Math.max(parsed, min), max)
}
