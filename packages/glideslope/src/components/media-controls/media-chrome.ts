/**
 * Loads media-chrome's custom elements on first use.
 *
 * media-chrome defines its elements and probes the browser (`matchMedia`, a test `<video>`) as its
 * modules load. A static import would do that whenever anything imports Glideslope, on the server
 * as well, and it throws in jsdom. Importing it from `onMounted` instead keeps the library's
 * modules free of side effects and puts media-chrome in a chunk of its own.
 */
let loading: Promise<void> | undefined

/**
 * Whether media-chrome can run here. It needs `matchMedia` when it loads, and listens to a media
 * element's track lists. jsdom has neither, so tests render the controls without connecting them.
 */
function canRunMediaChrome(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') return false
  const tracks = document.createElement('video').textTracks as TextTrackList | undefined
  return typeof tracks?.addEventListener === 'function'
}

/**
 * Defines `<media-controller>` and the media-chrome elements Glideslope renders. Resolves `true`
 * once they are defined, or `false` where media-chrome can't run.
 */
export async function loadMediaChrome(): Promise<boolean> {
  if (!loading) {
    if (!canRunMediaChrome()) return false
    loading = Promise.all([
      import('media-chrome/dist/media-controller.js'),
      import('media-chrome/dist/media-time-range.js'),
      import('media-chrome/dist/media-time-display.js'),
      import('media-chrome/dist/media-duration-display.js'),
      import('media-chrome/dist/media-volume-range.js'),
    ]).then(
      () => undefined,
      (error: unknown) => {
        // Let a later mount try again, e.g. after a failed chunk request.
        loading = undefined
        throw error
      },
    )
  }
  await loading
  return true
}
