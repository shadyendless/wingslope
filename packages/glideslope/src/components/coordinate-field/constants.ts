import type { GsCoordinateSystem } from './types'

/** Short labels of the coordinate systems (used in the format popover). */
export const COORDINATE_FORMAT_LABELS: Record<GsCoordinateSystem, string> = {
  dd: 'DD',
  ddm: 'DDM',
  dms: 'DMS',
  mgrs: 'MGRS',
  utm: 'UTM',
}

/** Full names of the coordinate systems (used in the paste disambiguation dialog). */
export const COORDINATE_FORMAT_NAMES: Record<GsCoordinateSystem, string> = {
  dd: 'Decimal Degrees',
  ddm: 'Degrees Decimal Minutes',
  dms: 'Degrees Minutes Seconds',
  mgrs: 'Military Grid Reference System',
  utm: 'Universal Transverse Mercator',
}

/** Every supported coordinate system, in display order. */
export const COORDINATE_SYSTEMS: readonly GsCoordinateSystem[] = ['dd', 'dms', 'ddm', 'mgrs', 'utm']
