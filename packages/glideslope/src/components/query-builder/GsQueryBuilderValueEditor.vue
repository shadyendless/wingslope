<script setup lang="ts">
/**
 * @internal The query builder's value editor: picks a checkbox, radio group, select, switch, text
 * field or text area by the rule's value editor type, and renders two of them (a start and an
 * end) for range operators such as `between` and `during`. Renders nothing for the `null` and
 * `notNull` operators.
 */
import {
  getMultiValueUpdate,
  getParseNumberMethod,
  toArray,
  type RuleType,
} from '@react-querybuilder/vue'
import { computed } from 'vue'
import { multiValueOperators } from './constants'
import GsQueryBuilderCheckboxEditor from './GsQueryBuilderCheckboxEditor.vue'
import GsQueryBuilderRadioEditor from './GsQueryBuilderRadioEditor.vue'
import GsQueryBuilderSelectEditor from './GsQueryBuilderSelectEditor.vue'
import GsQueryBuilderSwitchEditor from './GsQueryBuilderSwitchEditor.vue'
import GsQueryBuilderTextareaEditor from './GsQueryBuilderTextareaEditor.vue'
import GsQueryBuilderTextEditor from './GsQueryBuilderTextEditor.vue'
import type { GsQueryBuilderValueEditorProps, GsQueryBuilderValueEditors } from './types'

// The query builder passes every control its whole prop bag; only the declared props are used.
defineOptions({ inheritAttrs: false })

const {
  operator,
  value,
  handleOnChange,
  rule,
  fieldData,
  type,
  inputType,
  values,
  listsAsArrays = false,
  parseNumbers,
  disabled = false,
  className,
} = defineProps<GsQueryBuilderValueEditorProps>()

const valueEditors: GsQueryBuilderValueEditors = {
  checkbox: GsQueryBuilderCheckboxEditor,
  radio: GsQueryBuilderRadioEditor,
  select: GsQueryBuilderSelectEditor,
  switch: GsQueryBuilderSwitchEditor,
  text: GsQueryBuilderTextEditor,
  textarea: GsQueryBuilderTextareaEditor,
}

const editor = computed(() =>
  operator === 'null' || operator === 'notNull' ? undefined : valueEditors[type ?? 'text'],
)

/** Props every editor gets. */
const shared = computed(() => ({
  fieldData,
  type,
  inputType,
  values,
  listsAsArrays,
  disabled,
  className,
}))

const valueAsArray = computed<unknown[]>(() => toArray(value, { retainEmptyStrings: true }))

/** For range operators, a start and an end editor, each validated on its own value. */
const terms = computed(() =>
  multiValueOperators.includes(operator)
    ? (['start', 'end'] as const).map((term, index) => {
        const termValue = valueAsArray.value[index]
        return {
          term,
          value: termValue,
          rule: { ...rule, value: termValue } satisfies RuleType,
          label: `${fieldData.label} ${term}`,
          handleOnChange: (next: unknown) => changeTerm(next, index),
        }
      })
    : undefined,
)

function changeTerm(next: unknown, index: number) {
  handleOnChange(
    getMultiValueUpdate({
      value: next,
      index,
      valueAsArray: valueAsArray.value,
      operator,
      values,
      listsAsArrays,
      parseNumberMethod: getParseNumberMethod({ parseNumbers, inputType }),
    }),
  )
}
</script>

<template>
  <template v-if="editor">
    <template v-if="terms">
      <div v-for="term in terms" :key="`${fieldData.name}-${term.term}`">
        <component
          :is="editor"
          v-bind="shared"
          :value="term.value"
          :rule="term.rule"
          :label="term.label"
          :handle-on-change="term.handleOnChange"
        />
      </div>
    </template>
    <component
      :is="editor"
      v-else
      v-bind="shared"
      :value="value"
      :rule="rule"
      :label="fieldData.label"
      :handle-on-change="handleOnChange"
    />
  </template>
</template>
