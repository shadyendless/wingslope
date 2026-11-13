export type GsAccordionVariant = 'cozy' | 'compact'

export interface GsAccordionGroupProps {
  /** Allow several sections open at once; the model becomes an array. */
  multiple?: boolean
  /** Row density for every accordion in the group. @default 'cozy' */
  variant?: GsAccordionVariant
  disabled?: boolean
}

export interface GsAccordionProps {
  /** Identifies the section inside a `GsAccordionGroup`. Generated when omitted. */
  value?: string
  /** Row density. Inside a group, defaults to the group's. @default 'cozy' */
  variant?: GsAccordionVariant
  disabled?: boolean
}

export interface GsAccordionTriggerProps {
  /** Heading level of the trigger. @default 3 */
  level?: 1 | 2 | 3 | 4 | 5 | 6
  /**
   * Classes for the trigger's parts:
   * - `heading`: the heading element (`h3` by default) around the button
   * - `trigger`: the button that expands and collapses the accordion
   */
  classes?: {
    heading?: string
    trigger?: string
  }
}
