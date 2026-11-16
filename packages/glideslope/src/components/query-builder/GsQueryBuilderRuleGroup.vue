<script setup lang="ts">
/**
 * @internal A group of rules: a header with the combinator choice and the clone, lock and remove
 * buttons, a body laying its rules and subgroups out in a grid, and a footer with the add rule
 * and add group buttons. The root group has no clone or remove button.
 */
import {
  TestID,
  isRuleGroup,
  provideCurrentRuleGroup,
  provideQueryBuilderNode,
  useRuleGroup,
  type RuleGroupProps,
} from '@react-querybuilder/vue'
import { computed, type Component } from 'vue'

defineOptions({ inheritAttrs: false })

const props = defineProps<RuleGroupProps>()

const {
  ruleGroup,
  combinator,
  disabled,
  muted,
  validationResult,
  classNames,
  outerClassName,
  pathsMemo,
  onCombinatorChange,
  addRule,
  addGroup,
  cloneGroup,
  toggleLockGroup,
  removeGroup,
} = useRuleGroup(() => props)

provideQueryBuilderNode(
  () => props.schema,
  () => props.actions,
)
provideCurrentRuleGroup(ruleGroup, () => props.path)

const controls = computed(() => props.schema.controls)
const translations = computed(() => props.translations)
const isRoot = computed(() => props.path.length === 0)

/** Props every control of the group gets. */
const common = computed(() => ({
  context: props.context as unknown,
  disabled: disabled.value,
  level: props.path.length,
  path: props.path,
  schema: props.schema,
  validation: validationResult.value,
  rules: ruleGroup.value.rules,
}))

const combinatorSelector = computed(() => ({
  ...common.value,
  testID: TestID.combinators,
  options: props.schema.combinators,
  ruleGroup: ruleGroup.value,
  value: combinator.value,
  title: translations.value.combinators?.title,
  className: classNames.value.combinators,
  handleOnChange: onCombinatorChange,
}))

const cloneAction = computed(() => ({
  ...common.value,
  testID: TestID.cloneGroup,
  label: translations.value.cloneRuleGroup?.label,
  title: translations.value.cloneRuleGroup?.title,
  className: classNames.value.cloneGroup,
  handleOnClick: cloneGroup,
  ruleOrGroup: ruleGroup.value,
}))

const lockAction = computed(() => ({
  ...common.value,
  testID: TestID.lockGroup,
  label: translations.value.lockGroup?.label,
  title: translations.value.lockGroup?.title,
  className: classNames.value.lockGroup,
  handleOnClick: toggleLockGroup,
  disabledTranslation: props.parentDisabled ? undefined : translations.value.lockGroupDisabled,
  ruleOrGroup: ruleGroup.value,
}))

const removeAction = computed(() => ({
  ...common.value,
  testID: TestID.removeGroup,
  label: translations.value.removeGroup?.label,
  title: translations.value.removeGroup?.title,
  className: classNames.value.removeGroup,
  handleOnClick: removeGroup,
  ruleOrGroup: ruleGroup.value,
}))

const addRuleAction = computed(() => ({
  ...common.value,
  testID: TestID.addRule,
  label: translations.value.addRule?.label,
  title: translations.value.addRule?.title,
  className: classNames.value.addRule,
  handleOnClick: addRule,
  ruleOrGroup: ruleGroup.value,
}))

const addGroupAction = computed(() => ({
  ...common.value,
  testID: TestID.addGroup,
  label: translations.value.addGroup?.label,
  title: translations.value.addGroup?.title,
  className: classNames.value.addGroup,
  handleOnClick: addGroup,
  ruleOrGroup: ruleGroup.value,
}))

interface Child {
  key: string
  component: Component
  props: Record<string, unknown>
}

/** The group's rules and subgroups. Independent combinators (strings) aren't supported. */
const children = computed(() =>
  ruleGroup.value.rules.flatMap((item, index): Child[] => {
    if (typeof item === 'string') return []
    const info = pathsMemo.value[index]
    const shared = {
      id: item.id,
      schema: props.schema,
      actions: props.actions,
      path: info?.path ?? [...props.path, index],
      translations: props.translations,
      disabled: !!info?.disabled || !!item.disabled,
      parentDisabled: props.parentDisabled || disabled.value,
      parentMuted: props.parentMuted || muted.value,
      shiftUpDisabled: isRoot.value && index === 0,
      shiftDownDisabled: isRoot.value && index === ruleGroup.value.rules.length - 1,
      context: props.context as unknown,
    }
    const key = item.id ?? String(index)
    return isRuleGroup(item)
      ? [{ key, component: controls.value.ruleGroup, props: { ...shared, ruleGroup: item } }]
      : [{ key, component: controls.value.rule, props: { ...shared, rule: item } }]
  }),
)
</script>

<template>
  <div :class="outerClassName">
    <div :class="classNames.header">
      <component :is="controls.combinatorSelector" v-bind="combinatorSelector" />
      <div v-if="schema.showCloneButtons && !isRoot">
        <component :is="controls.cloneGroupAction" v-bind="cloneAction" />
      </div>
      <div v-if="schema.showLockButtons">
        <component :is="controls.lockGroupAction" v-bind="lockAction" />
      </div>
      <div v-if="!isRoot">
        <component :is="controls.removeGroupAction" v-bind="removeAction" />
      </div>
    </div>
    <div :class="classNames.body">
      <component
        :is="child.component"
        v-for="child in children"
        :key="child.key"
        v-bind="child.props"
      />
    </div>
    <div :class="classNames.header">
      <component :is="controls.addRuleAction" v-bind="addRuleAction" />
      <component
        :is="controls.addGroupAction"
        v-if="schema.maxLevels > path.length"
        v-bind="addGroupAction"
      />
    </div>
  </div>
</template>
