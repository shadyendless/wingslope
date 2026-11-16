import {
  colorToHex,
  convertToHsb,
  convertToHsl,
  convertToRgb,
  parseColor,
  type Color,
} from 'reka-ui'

/** An RGBA tuple with every channel 0–255 (deck.gl style). The alpha channel is optional. */
export type GsColorTuple =
  | readonly [number, number, number]
  | readonly [number, number, number, number]

/** A CSS color string, an RGBA tuple (0–255), or a Reka UI `Color` object. */
export type GsColorInput = string | GsColorTuple | Color

/**
 * The format a color picker emits: a lowercase hex string (`#rrggbb` or `#rrggbbaa`), an RGBA
 * tuple (`[r, g, b, a]`, every channel 0–255) or a Reka UI `Color` object.
 */
export type GsColorFormat = 'hex' | 'rgba' | 'color'

const clampByte = (n: number) => Math.round(Math.min(255, Math.max(0, n)))

function isTuple(input: GsColorInput): input is GsColorTuple {
  return Array.isArray(input)
}

/** Parses any supported color input into a Reka UI `Color`. */
export function toColor(input: GsColorInput): Color {
  if (typeof input === 'string') return parseColor(input)
  if (isTuple(input)) {
    const [r, g, b, a = 255] = input
    return {
      space: 'rgb',
      r: clampByte(r),
      g: clampByte(g),
      b: clampByte(b),
      alpha: clampByte(a) / 255,
    }
  }
  return input
}

/** Normalizes any supported color input to a lowercase hex string (`#rrggbb` or `#rrggbbaa`). */
export function toHex(input: GsColorInput): string {
  return colorToHex(toColor(input)).toLowerCase()
}

/** The format of a color value: `hex` for any string, `rgba` for a tuple, `color` for a `Color`. */
export function colorFormatOf(input: GsColorInput): GsColorFormat {
  if (typeof input === 'string') return 'hex'
  return isTuple(input) ? 'rgba' : 'color'
}

/**
 * Converts a color to `format`. For `color`, the result takes the color space of `like` when that
 * is a `Color` too (a model bound to an HSB color gets HSB colors back), and otherwise keeps the
 * color's own space.
 */
export function formatColor(
  color: Color,
  format: GsColorFormat,
  like?: GsColorInput,
): GsColorInput {
  if (format === 'hex') return toHex(color)
  if (format === 'rgba') {
    const { r, g, b, alpha } = convertToRgb(color)
    return [clampByte(r), clampByte(g), clampByte(b), clampByte(alpha * 255)]
  }
  const space =
    like !== undefined && colorFormatOf(like) === 'color' ? (like as Color).space : color.space
  if (space === 'hsb') return convertToHsb(color)
  if (space === 'hsl') return convertToHsl(color)
  return convertToRgb(color)
}
