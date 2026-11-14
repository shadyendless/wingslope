import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h, nextTick, ref } from 'vue'
import { useFlashcard } from './context'
import GsFlashcard from './GsFlashcard.vue'
import GsFlashcardAdditionalData from './GsFlashcardAdditionalData.vue'
import GsFlashcardDetailsLabel from './GsFlashcardDetailsLabel.vue'
import GsFlashcardDetailsList from './GsFlashcardDetailsList.vue'
import GsFlashcardDetailsValue from './GsFlashcardDetailsValue.vue'
import GsFlashcardHero from './GsFlashcardHero.vue'

const details = [
  { label: 'OBJECTID', value: 75 },
  { label: 'NAME', value: 'Acrisure Stadium' },
  { label: 'LATITUDE', value: '40-26-48.22N' },
  { label: 'LONGITUDE', value: '080-00-56.66W' },
  { label: 'CITY', value: 'Pittsburgh' },
  { label: 'STATE', value: 'PA' },
  { label: 'STATUS_CODE', value: 'Open' },
]

function setup(loading = false) {
  const isLoading = ref(loading)
  const Card = defineComponent({
    setup: () => () =>
      h(
        GsFlashcard,
        { loading: isLoading.value, header: 'IDENTIFIER', subheader: 'DATA', class: 'custom' },
        () => [
          h(GsFlashcardHero, { 'data-testid': 'hero' }),
          h(GsFlashcardAdditionalData, null, () => 'SECONDARY_DATA_01'),
          h(GsFlashcardAdditionalData, null, () => 'SECONDARY_DATA_02'),
          h(GsFlashcardDetailsList, { 'data-testid': 'details', class: 'own-list' }, () =>
            details.flatMap((detail) => [
              h(GsFlashcardDetailsLabel, null, () => detail.label),
              h(GsFlashcardDetailsValue, null, () => String(detail.value)),
            ]),
          ),
        ],
      ),
  })
  const result = render(Card)
  return { ...result, isLoading }
}

describe('GsFlashcard', () => {
  it('renders the header, subheader and additional data', () => {
    const { container } = setup()
    expect(screen.getByRole('heading', { level: 3, name: 'IDENTIFIER' })).toHaveClass('header')
    expect(screen.getByText('DATA')).toHaveClass('subheader')
    expect(screen.getByText('SECONDARY_DATA_01')).toHaveClass('data')
    expect(screen.getByText('SECONDARY_DATA_02')).toBeInTheDocument()
    expect(container.firstElementChild).toHaveClass('container', 'custom')
  })

  it('renders the details as a justified details list, hiding pairs after the fifth', () => {
    setup()
    const list = screen.getByTestId('details')
    expect(list.tagName).toBe('DL')
    expect(list).toHaveClass('list', 'details-list', 'own-list')
    expect(screen.getByText('OBJECTID').tagName).toBe('DT')
    expect(screen.getByText('OBJECTID')).toHaveClass('details-label', 'justify')
    expect(screen.getByText('Acrisure Stadium').tagName).toBe('DD')
    expect(screen.getByText('Acrisure Stadium')).toHaveClass('details-value', 'justify')
    // The sixth pair onwards is hidden by `:nth-of-type(n + 6)` on these classes.
    expect(screen.getByText('STATE')).toHaveClass('details-label')
  })

  it('shows skeletons and hides the header and additional data while loading', async () => {
    const { isLoading } = setup(true)
    expect(screen.queryByText('IDENTIFIER')).not.toBeInTheDocument()
    expect(screen.queryByText('SECONDARY_DATA_01')).not.toBeInTheDocument()

    const hero = screen.getByTestId('hero')
    expect(hero).toHaveClass('loading')
    expect(hero.childElementCount).toBe(2)
    expect(hero.children[1]).toHaveClass('skeleton', 'half')

    // Every label and value shows a skeleton in place of its content.
    expect(screen.queryByText('OBJECTID')).not.toBeInTheDocument()
    const list = screen.getByTestId('details')
    expect(list.querySelectorAll('dt > .skeleton, dd > .skeleton')).toHaveLength(details.length * 2)

    isLoading.value = false
    await nextTick()
    expect(screen.getByText('IDENTIFIER')).toBeInTheDocument()
    expect(screen.getByText('SECONDARY_DATA_01')).toBeInTheDocument()
    expect(screen.getByText('OBJECTID')).toBeInTheDocument()
  })

  it('shares its state through useFlashcard()', async () => {
    const loading = ref(false)
    const Part = defineComponent({
      setup() {
        const flashcard = useFlashcard()
        const text = computed(() => (flashcard.loading ? 'Loading…' : flashcard.header))
        return () => h('p', text.value)
      },
    })
    render(
      defineComponent({
        setup: () => () =>
          h(GsFlashcard, { loading: loading.value, header: 'RAVEN 21', subheader: 'F-16C' }, () =>
            h(Part),
          ),
      }),
    )
    expect(screen.getByText('RAVEN 21')).toBeInTheDocument()
    loading.value = true
    await nextTick()
    expect(screen.getByText('Loading…')).toBeInTheDocument()
  })
})
