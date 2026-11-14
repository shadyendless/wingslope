export interface GsClockProps {
  /**
   * Formats the current time. Defaults to
   * `new Intl.DateTimeFormat('en-US', { timeStyle: 'long', timeZone: 'UTC', hour12: false })`,
   * which shows e.g. `15:54:14 UTC`.
   */
  formatter?: Intl.DateTimeFormat
}
