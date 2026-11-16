<script setup lang="ts">
/**
 * @internal One rule of a query: an optional connecting line, then the field, operator, value and
 * value source controls, then the remove, clone and lock buttons. It renders three cells of its
 * group's grid (two without lines), so it has no root element.
 */
import {
  TestID,
  provideCurrentRule,
  provideQueryBuilderNode,
  useCurrentRuleGroup,
  useRule,
  type RuleProps,
} from '@react-querybuilder/vue'
import { computed } from 'vue'
import GsLines from '../lines/GsLines.vue'
import styles from './styles.module.css'
import type { GsQueryBuilderContextType } from './types'

defineOptions({ inheritAttrs: false })

const props = defineProps<RuleProps>()

const {
  ctx,
  disabled,
  classNames,
  outerClassName,
  fieldData,
  valueEditorSeparator,
  onChangeField,
  onChangeOperator,
  onChangeValueSource,
  onChangeValue,
  cloneRule,
  toggleLockRule,
  removeRule,
} = useRule(() => props)

// Read before providing this rule, so it is the group this rule belongs to.
const group = useCurrentRuleGroup()
provideQueryBuilderNode(
  () => props.schema,
  () => props.actions,
)
provideCurrentRule(
  () => props.rule,
  () => props.path,
)

const display = computed(() => props.context as Partial<GsQueryBuilderContextType> | undefined)
const isLast = computed(() => {
  const rules = group?.value.rules
  return !rules || props.path.at(-1) === rules.length - 1
})

/** Props every control of the rule gets. */
const common = computed(() => ({
  context: props.context as unknown,
  disabled: disabled.value,
  level: props.path.length,
  path: props.path,
  schema: props.schema,
  validation: ctx.value.validationResult,
}))

const controls = computed(() => props.schema.controls)
const translations = computed(() => props.translations)
const valueSource = computed(() => props.rule.valueSource ?? 'value')
const showValueSources = computed(
  () => !['null', 'notNull'].includes(props.rule.operator) && ctx.value.valueSources.length > 1,
)

const fieldSelector = computed(() => ({
  ...common.value,
  testID: TestID.fields,
  options: props.schema.fields,
  title: translations.value.fields?.title,
  value: props.rule.field,
  operator: props.rule.operator,
  className: classNames.value.fields,
  handleOnChange: onChangeField,
  rule: props.rule,
}))

const operatorSelector = computed(() => ({
  ...common.value,
  testID: TestID.operators,
  field: props.rule.field,
  fieldData: fieldData.value,
  title: translations.value.operators?.title,
  options: ctx.value.operators,
  value: props.rule.operator,
  className: classNames.value.operators,
  handleOnChange: onChangeOperator,
  rule: props.rule,
}))

const valueEditor = computed(() => ({
  ...common.value,
  testID: TestID.valueEditor,
  field: props.rule.field,
  fieldData: fieldData.value,
  title: translations.value.value?.title,
  operator: props.rule.operator,
  value: props.rule.value as unknown,
  valueSource: valueSource.value,
  type: ctx.value.valueEditorType,
  inputType: ctx.value.inputType,
  values: ctx.value.values,
  listsAsArrays: props.schema.listsAsArrays,
  parseNumbers: props.schema.parseNumbers,
  separator: valueEditorSeparator.value,
  className: classNames.value.value,
  handleOnChange: onChangeValue,
  rule: props.rule,
}))

const valueSourceSelector = computed(() => ({
  ...common.value,
  testID: TestID.valueSourceSelector,
  field: props.rule.field,
  fieldData: fieldData.value,
  title: translations.value.valueSourceSelector?.title,
  options: ctx.value.valueSourceOptions,
  value: valueSource.value,
  className: classNames.value.valueSource,
  handleOnChange: onChangeValueSource,
  rule: props.rule,
}))

const removeAction = computed(() => ({
  ...common.value,
  testID: TestID.removeRule,
  label: translations.value.removeRule?.label ?? 'remove',
  title: translations.value.removeRule?.title ?? 'remove',
  className: classNames.value.removeRule,
  handleOnClick: removeRule,
  ruleOrGroup: props.rule,
}))

const cloneAction = computed(() => ({
  ...common.value,
  testID: TestID.cloneRule,
  label: translations.value.cloneRule?.label ?? 'clone',
  title: translations.value.cloneRule?.title ?? 'clone',
  className: classNames.value.cloneRule,
  handleOnClick: cloneRule,
  ruleOrGroup: props.rule,
}))

const lockAction = computed(() => ({
  ...common.value,
  testID: TestID.lockRule,
  label: translations.value.lockRule?.label ?? 'lock',
  title: translations.value.lockRule?.title ?? 'lock',
  className: classNames.value.lockRule,
  handleOnClick: toggleLockRule,
  disabledTranslation: props.parentDisabled ? undefined : translations.value.lockRuleDisabled,
  ruleOrGroup: props.rule,
}))
</script>

<template>
  <GsLines
    v-if="display?.showRuleLines"
    :variant="isLast ? 'last' : 'branch'"
    size="small"
    :class="styles.ruleLines"
  />
  <div :class="outerClassName">
    <component :is="controls.fieldSelector" v-bind="fieldSelector" />
    <component :is="controls.operatorSelector" v-bind="operatorSelector" />
    <component :is="controls.valueEditor" v-bind="valueEditor" />
    <component
      :is="controls.valueSourceSelector"
      v-if="showValueSources"
      v-bind="valueSourceSelector"
    />
  </div>
  <div :class="outerClassName">
    <component :is="controls.removeRuleAction" v-bind="removeAction" />
    <component :is="controls.cloneRuleAction" v-if="schema.showCloneButtons" v-bind="cloneAction" />
    <component :is="controls.lockRuleAction" v-if="schema.showLockButtons" v-bind="lockAction" />
  </div>
</template>
