import type { Color } from 'reka-ui'
import { shallowRef, toValue, watch, type MaybeRefOrGetter, type Ref } from 'vue'
import { colorFormatOf, formatColor, type GsColorFormat, type GsColorInput } from './colors'

/**
 * Returns a function that converts a picked color to the format the model is emitted in: the
 * `format` prop when set, otherwise the format of the last value bound to the model (so choosing
 * "no color" and then a color keeps it), or hex while nothing has been bound.
 */
export function useColorFormat(
  model: Readonly<Ref<GsColorInput | undefined>>,
  format: MaybeRefOrGetter<GsColorFormat | undefined>,
) {
  const lastBound = shallowRef<GsColorInput>()
  watch(
    model,
    (value) => {
      if (value !== undefined) lastBound.value = value
    },
    { immediate: true },
  )

  return (color: Color): GsColorInput => {
    const like = lastBound.value
    return formatColor(color, toValue(format) ?? (like ? colorFormatOf(like) : 'hex'), like)
  }
}
