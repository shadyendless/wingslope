import type { Meta, StoryObj } from '@storybook/vue3-vite'
import AddIcon from '@wingbrace/glideslope-icons/add'
import { action } from 'storybook/actions'
import { ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsIcon from '../icon/GsIcon.vue'
import { defaultQuery, fields } from './__fixtures__/example-configuration'
import GsQueryBuilder from './GsQueryBuilder.vue'
import type { RuleGroupType } from './types'

/**
 * A Glideslope port of React Query Builder, built on its Vue edition:
 * https://github.com/react-querybuilder/vue-querybuilder
 */
const meta = {
  title: 'Components/QueryBuilder',
  component: GsQueryBuilder,
  args: {
    orientation: 'horizontal',
    disabled: false,
    showCloneButtons: false,
    showLockButtons: false,
    showRuleLines: true,
  },
  argTypes: {
    orientation: { control: 'select', options: ['horizontal', 'vertical'] },
    disabled: {
      control: {
        type: 'boolean',
      },
    },
  },
  parameters: {
    controls: {
      include: ['disabled', 'orientation', 'showCloneButtons', 'showLockButtons', 'showRuleLines'],
    },
    docs: {
      subtitle: 'Builds a complex formatted query for filtering a dataset',
    },
  },
} satisfies Meta<typeof GsQueryBuilder>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: { GsQueryBuilder },
    setup() {
      const query = ref<RuleGroupType>(defaultQuery)
      const onQueryChange = action('update:query')

      function handleQueryChange(next: RuleGroupType) {
        onQueryChange(next)
        query.value = next
      }

      return { args, fields, query, handleQueryChange }
    },
    template: `
      <GsQueryBuilder
        v-bind="args"
        :fields="fields"
        :query="query"
        @update:query="handleQueryChange"
      />`,
  }),
}

/** Glideslope only: replaces a control with its scoped slot, here `#addRuleAction`. */
export const ControlSlots: Story = {
  render: (args) => ({
    components: { GsQueryBuilder, GsButton, GsIcon, AddIcon },
    setup() {
      const query = ref<RuleGroupType>({
        combinator: 'AND',
        rules: [{ field: 'COUNTRY', operator: '=', value: 'Canada' }],
      })
      return { args, fields, query }
    },
    template: `
      <GsQueryBuilder v-bind="args" v-model:query="query" :fields="fields">
        <template #addRuleAction="{ title, disabled, handleOnClick }">
          <GsButton size="small" color="accent" :disabled="disabled" @click="handleOnClick">
            <GsIcon><AddIcon /></GsIcon>
            {{ title }}
          </GsButton>
        </template>
      </GsQueryBuilder>`,
  }),
}
