import {
  computed,
  inject,
  provide,
  toValue,
  type ComputedRef,
  type InjectionKey,
  type MaybeRefOrGetter,
  type ShallowRef,
} from 'vue'
import type { GsMediaStore } from './types'

/**
 * The store of the nearest `GsMediaController`. It is `undefined` until media-chrome has loaded
 * and the `<media-controller>` element has created its store.
 */
type MediaStoreRef = Readonly<ShallowRef<GsMediaStore | undefined>>

const MEDIA_STORE: InjectionKey<MediaStoreRef> = Symbol('GsMediaStore')
const MEDIA_CONTROLS_DISABLED: InjectionKey<ComputedRef<boolean>> =
  Symbol('GsMediaControlsDisabled')

export function provideMediaStore(store: MediaStoreRef): void {
  provide(MEDIA_STORE, store)
}

/** The nearest `GsMediaController`'s store. Throws outside one, like DT's `useMediaProviderGuard`. */
export function injectMediaStore(): MediaStoreRef {
  const store = inject(MEDIA_STORE, null)
  if (!store) {
    throw new Error(
      'Media controls must be used inside a GsMediaController (GsAudio and GsVideo provide one).',
    )
  }
  return store
}

/**
 * Disables the media controls below. Nested calls add to the outer state rather than replacing it,
 * so a disabled player keeps every control inside it disabled.
 */
export function provideMediaControlsDisabled(
  disabled: MaybeRefOrGetter<boolean | undefined>,
): void {
  const parent = inject(MEDIA_CONTROLS_DISABLED, null)
  provide(
    MEDIA_CONTROLS_DISABLED,
    computed(() => Boolean(toValue(disabled)) || (parent?.value ?? false)),
  )
}

/** A control's disabled state: its own prop, or the nearest disabled container. */
export function useMediaControlsDisabled(
  disabled?: MaybeRefOrGetter<boolean | undefined>,
): ComputedRef<boolean> {
  const parent = inject(MEDIA_CONTROLS_DISABLED, null)
  return computed(() => Boolean(toValue(disabled)) || (parent?.value ?? false))
}
