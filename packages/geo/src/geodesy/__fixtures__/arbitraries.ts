import fc from 'fast-check'

/** Any finite longitude in `[-180, 180]`. */
export const longitudeArbitrary = fc.double({
  min: -180,
  max: 180,
  noNaN: true,
})

/** Any finite latitude in `[-90, 90]`. */
export const latitudeArbitrary = fc.double({ min: -90, max: 90, noNaN: true })

/** An in-range `[longitude, latitude]` coordinate tuple. */
export const lonLatArbitrary: fc.Arbitrary<[number, number]> = fc.tuple(
  longitudeArbitrary,
  latitudeArbitrary,
)

/**
 * Half the circumference of the geodesy library's spherical Earth
 * (mean radius 6371 km); the great-circle distance between antipodal points.
 */
export const HALF_CIRCUMFERENCE_METERS = Math.PI * 6371e3
