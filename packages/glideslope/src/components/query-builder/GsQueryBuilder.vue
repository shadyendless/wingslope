<script setup lang="ts">
/**
 * A visual interface for building complex queries and filters: groups of rules (field, operator,
 * value) joined by AND / OR, which can nest. Bind the query object with `v-model:query`; without
 * it the query builder keeps its own query, starting from `default-query`.
 *
 * Built on `@react-querybuilder/vue`, with Glideslope controls: comboboxes for fields and
 * operators, text fields, checkboxes, switches and radios for values, and buttons for actions.
 * Drag and drop, shift actions, the "not" toggle and independent combinators are turned off, and
 * list values are stored as arrays. Replace any control with `control-elements` or the matching
 * scoped slot (`#valueEditor`, `#addRuleAction`, …), and add classes to parts with `classes`.
 *
 * Every control receives `orientation` and `show-rule-lines` in its `context` prop, merged into
 * the `context` you pass, which must then be a plain object.
 *
 * @example
 * ```vue
 * <GsQueryBuilder
 *   v-model:query="query"
 *   :fields="[
 *     { name: 'firstName', label: 'First Name' },
 *     { name: 'age', label: 'Age', inputType: 'number' },
 *   ]"
 *   orientation="vertical"
 * />
 * ```
 */
import {
  mergeClassnames,
  QueryBuilder,
  type Classnames,
  type ControlElementsProp,
  type FullField,
} from '@react-querybuilder/vue'
import { computed } from 'vue'
import GsQueryBuilderActionElement from './GsQueryBuilderActionElement.vue'
import GsQueryBuilderCloneAction from './GsQueryBuilderCloneAction.vue'
import GsQueryBuilderCombinatorSelector from './GsQueryBuilderCombinatorSelector.vue'
import GsQueryBuilderLockAction from './GsQueryBuilderLockAction.vue'
import GsQueryBuilderRemoveRuleAction from './GsQueryBuilderRemoveRuleAction.vue'
import GsQueryBuilderRule from './GsQueryBuilderRule.vue'
import GsQueryBuilderRuleGroup from './GsQueryBuilderRuleGroup.vue'
import GsQueryBuilderValueEditor from './GsQueryBuilderValueEditor.vue'
import GsQueryBuilderValueSelector from './GsQueryBuilderValueSelector.vue'
import styles from './styles.module.css'
import type {
  GsQueryBuilderContextType,
  GsQueryBuilderProps,
  GsQueryBuilderSlots,
  RuleGroupType,
} from './types'

const {
  orientation = 'horizontal',
  showRuleLines = true,
  classes,
  controlElements,
  context,
  // Unset flags must reach the query builder as `undefined`, so its own defaults apply.
  disabled = undefined,
  parseNumbers = undefined,
  enableMountQueryChange = undefined,
  debugMode = undefined,
  showCloneButtons = undefined,
  showLockButtons = undefined,
  resetOnFieldChange = undefined,
  resetOnOperatorChange = undefined,
  autoSelectField = undefined,
  autoSelectOperator = undefined,
  autoSelectValue = undefined,
  addRuleToNewGroups = undefined,
  suppressStandardClassnames = undefined,
  ...rest
} = defineProps<GsQueryBuilderProps>()

// Not `defineModel`: without `v-model:query`, the underlying query builder keeps the query.
const emit = defineEmits<{
  /** The query changed. Bind it with `v-model:query`. */
  'update:query': [query: RuleGroupType]
}>()

const slots = defineSlots<GsQueryBuilderSlots>()

/** The Glideslope controls. `controlElements` entries replace them. */
const defaultControlElements: ControlElementsProp<FullField, string> = {
  combinatorSelector: GsQueryBuilderCombinatorSelector,
  cloneGroupAction: GsQueryBuilderCloneAction,
  cloneRuleAction: GsQueryBuilderCloneAction,
  removeRuleAction: GsQueryBuilderRemoveRuleAction,
  lockGroupAction: GsQueryBuilderLockAction,
  lockRuleAction: GsQueryBuilderLockAction,
  ruleGroup: GsQueryBuilderRuleGroup,
  rule: GsQueryBuilderRule,
  actionElement: GsQueryBuilderActionElement,
  valueSelector: GsQueryBuilderValueSelector,
  valueEditor: GsQueryBuilderValueEditor,
}

const mergedElements = computed<ControlElementsProp<FullField, string>>(() => ({
  ...defaultControlElements,
  ...controlElements,
}))

const mergedClassnames = computed<Classnames>(() =>
  mergeClassnames(
    {
      queryBuilder: styles.queryBuilder,
      ruleGroup: styles.ruleGroup,
      header: styles.header,
      fields: styles.fields,
      operators: styles.operators,
      value: styles.value,
      cloneGroup: styles.cloneGroup,
      cloneRule: styles.cloneRule,
      lockGroup: styles.lockGroup,
      lockRule: styles.lockRule,
      rule: [styles.rule, styles[orientation]],
      body: [styles.body, showRuleLines ? styles.showRuleLines : styles.hideRuleLines],
    },
    classes,
  ),
)

const mergedContext = computed(
  () =>
    ({
      ...(context as Record<string, unknown> | undefined),
      orientation,
      showRuleLines,
    }) satisfies GsQueryBuilderContextType,
)
</script>

<template>
  <QueryBuilder
    v-bind="rest"
    :context="mergedContext"
    :control-elements="mergedElements"
    :control-classnames="mergedClassnames"
    :slots="slots"
    :disabled="disabled"
    :parse-numbers="parseNumbers"
    :enable-mount-query-change="enableMountQueryChange"
    :debug-mode="debugMode"
    :show-clone-buttons="showCloneButtons"
    :show-lock-buttons="showLockButtons"
    :reset-on-field-change="resetOnFieldChange"
    :reset-on-operator-change="resetOnOperatorChange"
    :auto-select-field="autoSelectField"
    :auto-select-operator="autoSelectOperator"
    :auto-select-value="autoSelectValue"
    :add-rule-to-new-groups="addRuleToNewGroups"
    :suppress-standard-classnames="suppressStandardClassnames"
    :show-not-toggle="false"
    :show-shift-actions="false"
    :show-combinators-between-rules="false"
    lists-as-arrays
    @update:query="emit('update:query', $event as RuleGroupType)"
  />
</template>
