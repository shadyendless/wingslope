import type { Meta, StoryObj } from '@storybook/vue3-vite'
import GsFlashcard from './GsFlashcard.vue'
import GsFlashcardAdditionalData from './GsFlashcardAdditionalData.vue'
import GsFlashcardDetailsLabel from './GsFlashcardDetailsLabel.vue'
import GsFlashcardDetailsList from './GsFlashcardDetailsList.vue'
import GsFlashcardDetailsValue from './GsFlashcardDetailsValue.vue'
import GsFlashcardHero from './GsFlashcardHero.vue'

const DEFAULT_DETAILS = Array.from({ length: 7 }, (_, index) => ({
  label: 'key',
  value: `value-${index + 1}`,
  id: `detail-${index + 1}`,
}))

const meta = {
  title: 'Components/Flashcard',
  component: GsFlashcard,
  args: {
    loading: false,
    header: 'IDENTIFIER',
    subheader: 'DATA',
  },
} satisfies Meta<typeof GsFlashcard>

export default meta
type Story = StoryObj<typeof meta>

export const Default: Story = {
  render: (args) => ({
    components: {
      GsFlashcard,
      GsFlashcardAdditionalData,
      GsFlashcardDetailsLabel,
      GsFlashcardDetailsList,
      GsFlashcardDetailsValue,
      GsFlashcardHero,
    },
    setup: () => ({ args, details: DEFAULT_DETAILS }),
    template: `
      <GsFlashcard v-bind="args">
        <GsFlashcardHero />
        <GsFlashcardAdditionalData>SECONDARY_DATA_01</GsFlashcardAdditionalData>
        <GsFlashcardAdditionalData>SECONDARY_DATA_02</GsFlashcardAdditionalData>
        <GsFlashcardDetailsList data-testid="secondary">
          <template v-for="detail in details" :key="detail.id">
            <GsFlashcardDetailsLabel>{{ detail.label }}</GsFlashcardDetailsLabel>
            <GsFlashcardDetailsValue>{{ detail.value }}</GsFlashcardDetailsValue>
          </template>
        </GsFlashcardDetailsList>
      </GsFlashcard>`,
  }),
}
