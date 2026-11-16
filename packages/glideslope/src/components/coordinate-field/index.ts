export { default as GsCoordinateField } from './GsCoordinateField.vue'
export { COORDINATE_FORMAT_LABELS, COORDINATE_FORMAT_NAMES, COORDINATE_SYSTEMS } from './constants'
export {
  areAllSegmentsFilled,
  areCoordinatesEqual,
  COORDINATE_EPSILON,
  COORDINATE_ERROR_MESSAGES,
  convertDDToDisplaySegments,
  convertDisplaySegmentsToDD,
  deduplicateMatchesByLocation,
  formatSegmentsToCoordinateString,
  getAllCoordinateFormats,
  hasAnySegmentValue,
  isCompleteCoordinate,
  parseCoordinatePaste,
  parseCoordinateStringToSegments,
  validateCoordinateSegments,
} from './coordinate-utils'
export { provideCoordinateFieldDefaults } from './defaults'
export {
  ddmSegmentConfigs,
  ddSegmentConfigs,
  dmsSegmentConfigs,
  EXPECTED_SEGMENT_COUNTS,
  GROUP_SEPARATOR,
  getEditableSegmentCount,
  getFormatDescription,
  getSegmentConfigs,
  getSegmentLabel,
  mgrsSegmentConfigs,
  utmSegmentConfigs,
} from './segment-configs'
export type {
  GsCoordinateErrorContext,
  GsCoordinateFieldClasses,
  GsCoordinateFieldDefaults,
  GsCoordinateFieldProps,
  GsCoordinateFieldVariant,
  GsCoordinateFormatResult,
  GsCoordinateSegmentConfig,
  GsCoordinateSegmentType,
  GsCoordinateSystem,
  GsCoordinateValue,
  GsParsedCoordinateMatch,
} from './types'
export { useCoordinateCopy } from './use-coordinate-copy'
export type { UseCoordinateCopyOptions, UseCoordinateCopyResult } from './use-coordinate-copy'
export { useCoordinateField } from './use-coordinate-field'
export type { UseCoordinateFieldOptions, UseCoordinateFieldResult } from './use-coordinate-field'
export { useCoordinateFieldState } from './use-coordinate-field-state'
export type {
  UseCoordinateFieldStateOptions,
  UseCoordinateFieldStateResult,
} from './use-coordinate-field-state'
export { useCoordinateFocus } from './use-coordinate-focus'
export type { UseCoordinateFocusOptions, UseCoordinateFocusResult } from './use-coordinate-focus'
export { useCoordinatePaste } from './use-coordinate-paste'
export type { UseCoordinatePasteOptions, UseCoordinatePasteResult } from './use-coordinate-paste'
export { useTimeoutCleanup } from './use-timeout-cleanup'
export type { UseTimeoutCleanupResult } from './use-timeout-cleanup'
