import { colorToHex, parseColor } from 'reka-ui'

/** A CSS color string, or an RGBA tuple with every channel 0–255 (deck.gl style). */
export type GsColorInput =
  string | readonly [number, number, number] | readonly [number, number, number, number]

const hexByte = (n: number) =>
  Math.round(Math.min(255, Math.max(0, n)))
    .toString(16)
    .padStart(2, '0')

/** Normalizes any supported color input to a lowercase hex string (`#rrggbb` or `#rrggbbaa`). */
export function toHex(input: GsColorInput): string {
  if (typeof input !== 'string') {
    const [r, g, b, a = 255] = input
    return `#${hexByte(r)}${hexByte(g)}${hexByte(b)}${a < 255 ? hexByte(a) : ''}`
  }
  return colorToHex(parseColor(input)).toLowerCase()
}
