import type { Field, RuleGroupType } from '../types'

/** Whether a value coerces to a 32-bit integer. */
const isInt32 = (value: unknown) => {
  const number = Number(value)
  return Number.isInteger(number) && number >= -2_147_483_648 && number <= 2_147_483_647
}

/** Whether a value is a non-empty string. */
const isFilled = (value: unknown) => typeof value === 'string' && value.length > 0

/** Accepts one value, or a `[start, end]` pair for range operators, when `check` accepts each. */
const singleOrPair = (check: (value: unknown) => boolean) => (value: unknown) =>
  check(value) || (Array.isArray(value) && value.length === 2 && value.every(check))

const int32OrRange = singleOrPair(isInt32)
const filledOrRange = singleOrPair(isFilled)

const temporalOperators = [
  { name: 'equals', value: 'tequals', label: 'is' },
  { name: 'during', value: 'during', label: 'occurs between' },
  { name: 'before', value: 'before', label: 'ends before' },
  { name: 'after', value: 'after', label: 'starts after' },
  { name: 'overlapped', value: 'overlappedby', label: 'starts during' },
  { name: 'overlaps', value: 'toverlaps', label: 'ends during' },
]

const numericOperators = [
  { name: '=', value: '=', label: 'is' },
  { name: '<', value: '<', label: 'less than' },
  { name: '>', value: '>', label: 'greater than' },
  { name: '<=', value: '<=', label: 'less than equal' },
  { name: '>=', value: '>=', label: 'greater than equal' },
  { name: 'between', value: 'between', label: 'between' },
  { name: 'in', value: 'in', label: 'in' },
]

/**
 * Sample fields and validators for building a query. They show what the query builder can do
 * and aren't required to use it.
 */
export const fields: Field[] = [
  {
    name: 'AK_HIGH',
    label: 'AK High',
    type: 'i32',
    inputType: 'number', // as in HTML input type <input type="number">
    operators: numericOperators,
    validator: (rule) => ({
      valid: int32OrRange(rule.value),
      reasons: ['Number must be in range.'],
    }),
  },
  {
    name: 'AK_LOW',
    label: 'AK Low',
    type: 'i32',
    inputType: 'number', // as in HTML input type <input type="number">
    operators: numericOperators,
    validator: (rule) => ({
      valid: int32OrRange(rule.value),
      reasons: ['Number must be in range.'],
    }),
  },
  {
    name: 'COUNTRY',
    label: 'Country',
    type: 'str',
    operators: [
      { name: '=', value: '=', label: 'is' },
      { name: 'like', value: 'like', label: 'like' },
      { name: 'in', value: 'in', label: 'in' },
    ],
    inputType: 'text',
    validator: (rule) => ({
      valid: isFilled(rule.value),
      reasons: ['At least one character is required.'],
    }),
  },
  {
    name: 'NOTES',
    label: 'Operator Notes',
    type: 'str',
    valueEditorType: 'textarea',
  },
  {
    name: 'OPERSTATUS',
    label: 'Is Operational',
    type: 'bool',
    defaultValue: false,
    operators: [{ name: '=', value: '=', label: 'is' }],
    valueEditorType: 'checkbox',
  },
  {
    name: 'DONUTS',
    label: 'Has Donuts',
    type: 'bool',
    operators: [{ name: '=', value: '=', label: 'is' }],
    valueEditorType: 'switch',
  },
  {
    name: 'SERVCITY',
    label: 'Service City',
    valueEditorType: 'select',
    values: [
      { name: 'Anchorage', label: 'Anchorage', value: 'Anchorage' },
      { name: 'Juneau', label: 'Juneau', value: 'Juneau' },
      { name: 'Fairbanks', label: 'Fairbanks', value: 'Fairbanks' },
      { name: 'Sitka', label: 'Sitka', value: 'Sitka' },
      { name: 'Montgomery', label: 'Montgomery', value: 'Montgomery' },
      { name: 'Birmingham', label: 'Birmingham', value: 'Birmingham' },
      { name: 'Huntsville', label: 'Huntsville', value: 'Huntsville' },
      { name: 'Mobile', label: 'Mobile', value: 'Mobile' },
    ],
    type: 'str',
    operators: [
      { name: '=', value: '=', label: 'is' },
      { name: 'like', value: 'like', label: 'like' },
      { name: 'in', value: 'in', label: 'in' },
      { name: 'between', value: 'between', label: 'between' },
    ],
  },
  {
    name: 'TYPE_CODE',
    label: 'Type Code',
    type: 'str',
    operators: [{ name: '=', value: '=', label: 'is' }],
    valueEditorType: 'radio',
    values: [
      { name: 'Heliport', label: 'Heliport', value: 'Heliport' },
      { name: 'Aerodrome', label: 'Aerodrome', value: 'Aerodrome' },
      { name: 'Unknown', label: 'Unknown', value: 'Unknown' },
    ],
    defaultValue: 'Aerodrome',
  },
  {
    name: 'ESTABLISHED',
    label: 'Established',
    type: 'date',
    operators: temporalOperators,
    inputType: 'date',
    validator: (rule) => ({
      valid: filledOrRange(rule.value),
      reasons: ['At least one character is required.'],
    }),
  },
  {
    name: 'MAINTENANCE',
    label: 'Maintenance',
    type: 'datetime',
    operators: temporalOperators,
    inputType: 'datetime-local', // mm/dd/yyyy hh:mm a
    validator: (rule) => ({
      valid: filledOrRange(rule.value),
      reasons: ['At least one character is required.'],
    }),
  },
  {
    name: 'PEAK_TRAFFIC',
    label: 'Peak Traffic',
    type: 'time',
    operators: temporalOperators,
    inputType: 'time', // hh:mm a
    validator: (rule) => ({
      valid: filledOrRange(rule.value),
      reasons: ['At least one character is required.'],
    }),
  },
]

/** An initial query that fills the rule set with one example of each kind of field. */
export const defaultQuery: RuleGroupType = {
  combinator: 'AND',
  rules: [
    { field: 'AK_HIGH', operator: '>', value: '10000' }, // i32
    { field: 'AK_LOW', operator: 'between', value: ['1000', '5000'] }, // between
    { field: 'COUNTRY', operator: 'like', value: 'Canada' }, // text
    { field: 'NOTES', operator: 'contains', value: 'Clear skies...' }, // textarea
    { field: 'SERVCITY', operator: 'like', value: 'Anchorage' }, // options with headers
    { field: 'OPERSTATUS', operator: '=', value: false }, // bool
    { field: 'DONUTS', operator: '=', value: true }, // switch
    { field: 'TYPE_CODE', operator: '=', value: 'Aerodrome' }, // radio
    {
      field: 'ESTABLISHED',
      operator: 'during',
      value: ['2024-10-01', '2024-11-01'],
    }, // date
    {
      field: 'PEAK_TRAFFIC',
      operator: 'overlaps',
      value: ['18:22:54', '19:22:54'],
    }, // time
    {
      field: 'MAINTENANCE',
      operator: 'overlapped',
      value: ['2024-10-01T18:22:54', '2024-11-01T18:22:54'],
    }, // datetime
  ],
}
