import { MediaUIEvents } from 'media-chrome/dist/constants.js'
import { computed, shallowRef, watch, type ComputedRef, type ShallowRef } from 'vue'
import { injectMediaStore } from './context'
import type { GsMediaAction, GsMediaState, GsMediaStore } from './types'

const {
  REGISTER_MEDIA_STATE_RECEIVER: _register,
  UNREGISTER_MEDIA_STATE_RECEIVER: _unregister,
  MEDIA_SHOW_TEXT_TRACKS_REQUEST: _showTextTracks,
  MEDIA_HIDE_TEXT_TRACKS_REQUEST: _hideTextTracks,
  ...requests
} = MediaUIEvents

/**
 * The request types `useMediaDispatch()` accepts, as in media-chrome's React store
 * (`media-chrome/react/media-store`).
 */
export const MediaActionTypes: Readonly<
  Omit<
    typeof MediaUIEvents,
    | 'REGISTER_MEDIA_STATE_RECEIVER'
    | 'UNREGISTER_MEDIA_STATE_RECEIVER'
    | 'MEDIA_SHOW_TEXT_TRACKS_REQUEST'
    | 'MEDIA_HIDE_TEXT_TRACKS_REQUEST'
  > & {
    MEDIA_ELEMENT_CHANGE_REQUEST: 'mediaelementchangerequest'
    FULLSCREEN_ELEMENT_CHANGE_REQUEST: 'fullscreenelementchangerequest'
  }
> = Object.freeze({
  ...requests,
  MEDIA_ELEMENT_CHANGE_REQUEST: 'mediaelementchangerequest',
  FULLSCREEN_ELEMENT_CHANGE_REQUEST: 'fullscreenelementchangerequest',
})

/**
 * The media store of the nearest `GsMediaController` (or `GsAudio` / `GsVideo`). It is
 * `undefined` until media-chrome has loaded in the browser. Throws outside a controller.
 *
 * @example
 * ```ts
 * const store = useMediaStore()
 * watchEffect(() => console.log(store.value?.getState().mediaPaused))
 * ```
 */
export function useMediaStore(): Readonly<ShallowRef<GsMediaStore | undefined>> {
  return injectMediaStore()
}

/**
 * Selects a value from the media state and keeps it up to date, like `useMediaSelector` in
 * media-chrome's React store. Until the store is ready, the selector sees an empty state, so give
 * it a fallback (`state.mediaPaused ?? true`). Throws outside a `GsMediaController`.
 *
 * @param selector Picks the value from the state. It runs on every state change.
 * @param equalityFn Decides whether a new value differs from the last. @default Object.is
 *
 * @example
 * ```ts
 * const paused = useMediaSelector((state) => state.mediaPaused ?? true)
 * ```
 */
export function useMediaSelector<T>(
  selector: (state: GsMediaState) => T,
  equalityFn: (previous: T, next: T) => boolean = Object.is,
): ComputedRef<T> {
  const store = injectMediaStore()
  const selected = shallowRef<T>(selector(store.value?.getState() ?? {}))
  watch(
    store,
    (current, _previous, onCleanup) => {
      if (!current) return
      // `subscribe` calls back with the current state straight away, then on every change.
      const unsubscribe = current.subscribe((state) => {
        const next = selector(state)
        if (!equalityFn(selected.value, next)) selected.value = next
      })
      onCleanup(unsubscribe)
    },
    { immediate: true },
  )
  return computed(() => selected.value)
}

/**
 * Returns a function that sends requests to the media store, like `useMediaDispatch` in
 * media-chrome's React store. Requests sent before the store is ready are dropped. Throws outside
 * a `GsMediaController`.
 *
 * @example
 * ```ts
 * const dispatch = useMediaDispatch()
 * dispatch({ type: MediaActionTypes.MEDIA_SEEK_REQUEST, detail: 0 })
 * ```
 */
export function useMediaDispatch(): (action: GsMediaAction) => void {
  const store = injectMediaStore()
  return (action) => store.value?.dispatch(action)
}
