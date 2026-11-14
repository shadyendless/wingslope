import { getCurrentScope, onScopeDispose } from 'vue'

export interface PointerSessionConfig<Session, Payload> {
  /** Runs before `onStart`; return `false` to ignore the press. */
  shouldStart?: (event: PointerEvent, payload: Payload) => boolean
  /** Called on pointerdown with what the caller passed to `start`. Return the session, or `null` to abort. */
  onStart: (event: PointerEvent, payload: Payload) => Session | null
  /** Called on every pointermove while the session is active. The session may be mutated in place. */
  onMove: (event: PointerEvent, session: Session) => void
  /** Called on pointerup or pointercancel, which end the session. */
  onEnd?: (event: PointerEvent, session: Session) => void
}

/**
 * Runs a pointer gesture (a drag or resize) against document-level listeners, so it keeps
 * tracking when the pointer leaves the element it started on.
 *
 * Listeners exist only during a gesture and are removed with an `AbortController`, also when the
 * owning scope (component) is disposed mid-gesture.
 */
export function usePointerSession<Session, Payload>(
  config: PointerSessionConfig<Session, Payload>,
) {
  let session: Session | null = null
  let controller: AbortController | null = null

  function end() {
    session = null
    controller?.abort()
    controller = null
  }

  function start(event: PointerEvent, payload: Payload) {
    if (config.shouldStart?.(event, payload) === false) return
    const next = config.onStart(event, payload)
    if (next === null) return

    // A second press before the first releases (a lost pointerup, or a resize handle pressed
    // mid-drag) would otherwise leave two sessions driving the same card.
    controller?.abort()
    session = next
    event.preventDefault()

    controller = new AbortController()
    const options = { signal: controller.signal }

    const onMove = (moveEvent: PointerEvent) => {
      if (session !== null) config.onMove(moveEvent, session)
    }
    const onEnd = (endEvent: PointerEvent) => {
      if (session === null) return
      config.onEnd?.(endEvent, session)
      end()
    }

    document.addEventListener('pointermove', onMove, options)
    document.addEventListener('pointerup', onEnd, options)
    document.addEventListener('pointercancel', onEnd, options)
  }

  if (getCurrentScope()) onScopeDispose(end)

  return { start }
}
