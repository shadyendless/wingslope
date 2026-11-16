// TODO: Make locale and format options configurable via GsGantt props (as in the Design Toolkit)
const DEFAULT_LOCALE = 'en-US'
const options: Intl.DateTimeFormatOptions = {
  minute: '2-digit',
  hour: '2-digit',
  day: '2-digit',
  month: 'short',
  timeZone: 'UTC',
  hour12: false,
}

const formatter = new Intl.DateTimeFormat(DEFAULT_LOCALE, options)
const labelCache = new Map<number, string>()

export function formatTimestampLabel(timestampMs: number): string {
  const cached = labelCache.get(timestampMs)

  if (cached !== undefined) {
    return cached
  }

  const parts = formatter.formatToParts(timestampMs)
  let minute = ''
  let hour = ''
  let day = ''
  let month = ''

  for (const part of parts) {
    switch (part.type) {
      case 'minute':
        minute = part.value
        break
      case 'hour':
        hour = part.value
        break
      case 'day':
        day = part.value
        break
      case 'month':
        month = part.value
        break
    }
  }

  const label =
    hour === '00' && minute === '00' ? `${day} ${month.toUpperCase()}` : `${hour}:${minute}`

  labelCache.set(timestampMs, label)

  if (labelCache.size > 500) {
    labelCache.clear()
  }

  return label
}
