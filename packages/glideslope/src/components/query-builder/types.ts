import type {
  ActionProps,
  Classnames,
  CombinatorSelectorProps,
  ControlSlots,
  Field as RQBField,
  FullCombinator,
  FullField,
  FullOperator,
  QueryBuilderProps as RQBQueryBuilderProps,
  QueryBuilderPropsBase,
  RuleGroupType as RQBRuleGroupType,
  RuleType,
  ValueEditorProps,
  ValueEditorType,
  ValueSelectorProps,
} from '@react-querybuilder/vue'
import type { Component } from 'vue'

/** Re-export of React Query Builder's `RuleGroupType`: the query object. */
export type RuleGroupType = RQBRuleGroupType

/** Re-export of React Query Builder's `Field`: one field a rule can filter on. */
export type Field = RQBField

/**
 * The `@react-querybuilder/vue` `QueryBuilder` props, with full field, operator and combinator
 * types.
 */
export type DefaultRQBProps = RQBQueryBuilderProps<
  RuleGroupType,
  FullField,
  FullOperator,
  FullCombinator
>

/**
 * Map of value editor types to the components that render them.
 *
 * `multiselect` is left out until there is a compatible multi-select field.
 */
export type GsQueryBuilderValueEditors = Record<
  Exclude<ValueEditorType, null | undefined | 'multiselect'> | (string & {}),
  Component
>

/** Layout settings every control receives in its `context` prop. */
export interface GsQueryBuilderContextType {
  /** Whether a rule's controls sit on one row or stack. */
  orientation: 'horizontal' | 'vertical'
  /** Whether connecting lines are drawn next to the rules. */
  showRuleLines: boolean
}

/**
 * Classes for the parts of a `GsQueryBuilder`, added to its own. Keys for features it doesn't
 * render (drag and drop, shift actions, the "not" toggle, mute, ungroup, undo/redo) are left out.
 */
export type GsQueryBuilderClasses = Partial<
  Omit<
    Classnames,
    | 'betweenRules'
    | 'branches'
    | 'dndDragging'
    | 'dndOver'
    | 'dndCopy'
    | 'dndGroup'
    | 'dndDropNotAllowed'
    | 'dndPreviewPosition'
    | 'dndHidden'
    | 'dragHandle'
    | 'shiftActions'
    | 'notToggle'
    | 'matchMode'
    | 'matchThreshold'
    | 'muteRule'
    | 'muteGroup'
    | 'muted'
    | 'ungroup'
    | 'undoRedoActions'
    | 'undoAction'
    | 'redoAction'
  >
>

/**
 * `@react-querybuilder/vue` props that `GsQueryBuilder` doesn't accept: features it turns off
 * (independent combinators, drag and drop, shift actions, the "not" toggle), features its layout
 * doesn't render, and props it replaces with Vue API (`v-model:query`, `classes`, slots).
 */
type OmittedProps =
  | 'showCombinatorsBetweenRules'
  | 'listsAsArrays'
  | 'showNotToggle'
  | 'showShiftActions'
  | 'showUndoRedo'
  | 'showMuteButtons'
  | 'showUngroupButtons'
  | 'getMatchModes'
  | 'getSubQueryBuilderProps'
  | 'onGroupRule'
  | 'onGroupGroup'
  | 'onUngroup'
  | 'onQueryChange'
  | 'controlClassnames'
  | 'slots'
  | 'manager'
  | 'parseNumbers'

export interface GsQueryBuilderProps extends Omit<
  QueryBuilderPropsBase<RuleGroupType, RuleType, FullField, FullOperator, FullCombinator>,
  OmittedProps
> {
  /** Whether a rule's field, operator and value sit on one row or stack. @default 'horizontal' */
  orientation?: 'horizontal' | 'vertical'
  /** Draws connecting lines next to the rules of each group. @default true */
  showRuleLines?: boolean
  /**
   * Extra classes for inner parts, keyed like React Query Builder's `controlClassnames`
   * (`queryBuilder`, `ruleGroup`, `header`, `body`, `rule`, `fields`, `operators`, `value`, …).
   * They are added to the component's own classes.
   */
  classes?: GsQueryBuilderClasses
  /**
   * Store values as numbers whenever possible: `true` or `'enhanced'`, `'native'` or `'strict'`
   * (optionally with `-limited`). See React Query Builder's `parseNumbers`.
   * @default false
   */
  parseNumbers?: ParseNumbersOption
}

/**
 * React Query Builder's `ParseNumbersPropConfig`, spelled out: Vue can't infer a runtime prop type
 * from its template literal type, so it would only accept booleans.
 */
type ParseNumbersOption =
  | boolean
  | 'enhanced'
  | 'native'
  | 'strict'
  | 'enhanced-limited'
  | 'native-limited'
  | 'strict-limited'

/**
 * Scoped slots that replace a control, one per `controlElements` key (`#valueEditor`,
 * `#addRuleAction`, …). Each receives the props the control would have. A slot wins over the
 * matching `controlElements` entry and over the query builder's own control.
 */
export type GsQueryBuilderSlots = ControlSlots<FullField, string>

/** Props the query builder's action buttons use (`GsQueryBuilderCloneAction`, …). */
export type GsQueryBuilderActionProps = Pick<
  ActionProps,
  'handleOnClick' | 'className' | 'title' | 'disabled' | 'disabledTranslation'
>

/** Props `GsQueryBuilderCombinatorSelector` uses. */
export type GsQueryBuilderCombinatorSelectorProps = Pick<
  CombinatorSelectorProps,
  'options' | 'value' | 'handleOnChange' | 'title' | 'disabled' | 'className'
>

/** @internal Props the query builder's value selector uses. */
export type GsQueryBuilderValueSelectorProps = Pick<
  ValueSelectorProps,
  | 'options'
  | 'value'
  | 'handleOnChange'
  | 'title'
  | 'disabled'
  | 'className'
  | 'multiple'
  | 'listsAsArrays'
>

/** @internal Props the query builder's value editor uses. */
export interface GsQueryBuilderValueEditorProps extends Pick<
  ValueEditorProps,
  | 'operator'
  | 'value'
  | 'handleOnChange'
  | 'rule'
  | 'fieldData'
  | 'type'
  | 'inputType'
  | 'values'
  | 'listsAsArrays'
  | 'disabled'
  | 'className'
> {
  parseNumbers?: ParseNumbersOption
}

/** @internal Props of the editors `GsQueryBuilderValueEditor` picks from by value editor type. */
export interface GsQueryBuilderEditorProps extends Omit<
  GsQueryBuilderValueEditorProps,
  'operator' | 'parseNumbers'
> {
  /** Accessible name of the editor. */
  label: string
}
