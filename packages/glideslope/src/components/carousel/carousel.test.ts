import { render, screen } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { describe, expect, it } from 'vitest'
import { computed, defineComponent, h, nextTick, ref } from 'vue'
import { CAROUSEL_ITEMS, MIXED_CAROUSEL_ITEMS } from './__fixtures__'
import { useCarousel } from './context'
import GsCarousel from './GsCarousel.vue'
import GsCarouselGallery from './GsCarouselGallery.vue'
import GsCarouselNext from './GsCarouselNext.vue'
import GsCarouselPosition from './GsCarouselPosition.vue'
import GsCarouselPrevious from './GsCarouselPrevious.vue'
import GsCarouselSelect from './GsCarouselSelect.vue'
import GsCarouselViewer from './GsCarouselViewer.vue'
import type { GsCarouselData } from './types'

function setup({
  items = CAROUSEL_ITEMS,
  position = 0,
  parts = () => [
    h(GsCarouselViewer),
    h(GsCarouselPrevious),
    h(GsCarouselGallery),
    h(GsCarouselNext),
    h(GsCarouselPosition),
    h(GsCarouselSelect),
  ],
}: {
  items?: GsCarouselData[]
  position?: number
  parts?: () => unknown
} = {}) {
  const model = ref(position)
  const result = render(() =>
    h(
      GsCarousel,
      {
        items,
        modelValue: model.value,
        'onUpdate:modelValue': (value: number) => (model.value = value),
      },
      { default: parts },
    ),
  )
  return { ...result, model, user: userEvent.setup() }
}

/** The viewer's image is the one showing the full-size `dataUrl`. */
function viewerImage(item: GsCarouselData) {
  return screen
    .getAllByRole<HTMLImageElement>('img', { name: item.title })
    .find((img) => img.getAttribute('src') === item.dataUrl)
}

describe('GsCarousel', () => {
  it('renders the viewer image and one thumbnail per item', () => {
    setup()
    expect(screen.getAllByRole('img')).toHaveLength(CAROUSEL_ITEMS.length + 1)
    expect(viewerImage(CAROUSEL_ITEMS[0]!)).toBeDefined()
  })

  it('disables the previous button at the start and the next button at the end', async () => {
    const { model } = setup()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeEnabled()

    model.value = CAROUSEL_ITEMS.length - 1
    await nextTick()
    expect(screen.getByRole('button', { name: 'Previous' })).toBeEnabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('moves to the previous and next items, updating v-model', async () => {
    const { model, user } = setup({ position: 1 })
    await user.click(screen.getByRole('button', { name: 'Previous' }))
    expect(model.value).toBe(0)
    await user.click(screen.getByRole('button', { name: 'Next' }))
    await user.click(screen.getByRole('button', { name: 'Next' }))
    expect(model.value).toBe(2)
    expect(viewerImage(CAROUSEL_ITEMS[2]!)).toBeDefined()
  })

  it('navigates to a thumbnail when pressed, and marks the active one pressed', async () => {
    const { model, user } = setup()
    const first = screen.getByRole('button', { name: CAROUSEL_ITEMS[0]!.title })
    const second = screen.getByRole('button', { name: CAROUSEL_ITEMS[1]!.title })
    expect(first).toHaveAttribute('aria-pressed', 'true')
    expect(second).toHaveAttribute('aria-pressed', 'false')

    await user.click(second)
    expect(model.value).toBe(1)
    expect(second).toHaveAttribute('aria-pressed', 'true')
    expect(first).toHaveAttribute('aria-pressed', 'false')

    // Pressing the active thumbnail again keeps it active.
    await user.click(second)
    expect(model.value).toBe(1)
    expect(second).toHaveAttribute('aria-pressed', 'true')
  })

  it('operates the controls from the keyboard', async () => {
    const { model, user } = setup({ parts: () => [h(GsCarouselPrevious), h(GsCarouselNext)] })
    await user.tab()
    expect(screen.getByRole('button', { name: 'Next' })).toHaveFocus()
    await user.keyboard('{Enter}')
    expect(model.value).toBe(1)
    await user.keyboard(' ')
    expect(model.value).toBe(2)
  })

  it('displays the current position and total count', () => {
    setup({ position: 1 })
    expect(screen.getByText(`2 / ${CAROUSEL_ITEMS.length}`)).toBeInTheDocument()
  })

  it('selects an item by title from the select', async () => {
    const { model, user } = setup({ position: 0 })
    const trigger = screen.getByRole('combobox', { name: 'Carousel item select' })
    expect(trigger).toHaveTextContent(CAROUSEL_ITEMS[0]!.title)
    await user.click(trigger)
    await user.click(await screen.findByRole('option', { name: CAROUSEL_ITEMS[3]!.title }))
    expect(model.value).toBe(3)
    expect(screen.getByText(`4 / ${CAROUSEL_ITEMS.length}`)).toBeInTheDocument()
  })

  it('works without v-model, keeping the position locally', async () => {
    render(GsCarousel, {
      props: { items: CAROUSEL_ITEMS },
      slots: { default: () => [h(GsCarouselNext), h(GsCarouselPosition)] },
    })
    await userEvent.click(screen.getByRole('button', { name: 'Next' }))
    expect(screen.getByText(`2 / ${CAROUSEL_ITEMS.length}`)).toBeInTheDocument()
  })

  it('shows videos and audio by their data type', async () => {
    const { model, container } = setup({
      items: MIXED_CAROUSEL_ITEMS,
      parts: () => h(GsCarouselViewer),
    })
    const media = container.querySelector('[data-media]')
    expect(media).toHaveAttribute('data-media', 'image')

    model.value = 1
    await nextTick()
    expect(media).toHaveAttribute('data-media', 'video')
    const video = container.querySelector('video')
    expect(video).toHaveAttribute('src', MIXED_CAROUSEL_ITEMS[1]!.dataUrl)
    expect(video).toHaveAttribute('poster', MIXED_CAROUSEL_ITEMS[1]!.thumbnailUrl)

    model.value = 2
    await nextTick()
    expect(media).toHaveAttribute('data-media', 'audio')
    expect(container.querySelector('audio')).toHaveAttribute(
      'src',
      MIXED_CAROUSEL_ITEMS[2]!.dataUrl,
    )
    expect(screen.getByText(MIXED_CAROUSEL_ITEMS[2]!.title)).toBeInTheDocument()
  })

  it('applies classes to the parts', () => {
    const { container } = setup({
      parts: () => [
        h(GsCarouselViewer, { class: 'own-viewer', classes: { media: 'own-media' } }),
        h(GsCarouselGallery, { class: 'own-gallery', classes: { item: 'own-item' } }),
        h(GsCarouselPrevious, { class: 'own-previous', variant: 'outline' }),
        h(GsCarouselPosition, { class: 'own-position' }),
        h(GsCarouselSelect, {
          class: 'own-select',
          classes: { select: { trigger: 'own-trigger' }, option: 'own-option' },
        }),
      ],
    })
    expect(container.querySelector('.viewer')).toHaveClass('own-viewer')
    expect(container.querySelector('[data-media]')).toHaveClass('viewer-item', 'own-media')
    expect(container.querySelector('.gallery-container')).toHaveClass('own-gallery')
    expect(screen.getByRole('button', { name: CAROUSEL_ITEMS[0]!.title })).toHaveClass(
      'gallery-item',
      'own-item',
    )
    expect(screen.getByRole('button', { name: 'Previous' })).toHaveClass(
      'navigation',
      'outline',
      'own-previous',
    )
    expect(screen.getByText(`1 / ${CAROUSEL_ITEMS.length}`)).toHaveClass('position', 'own-position')
    expect(screen.getByRole('combobox', { name: 'Carousel item select' })).toHaveClass(
      'gallery-select',
      'own-trigger',
    )
    expect(container.querySelector('.own-select')).toHaveClass('gallery-select')
  })

  it('lets a relabelled navigation button keep working', async () => {
    const { model, user } = setup({
      parts: () => h(GsCarouselNext, { 'aria-label': 'Suivant' }),
    })
    await user.click(screen.getByRole('button', { name: 'Suivant' }))
    expect(model.value).toBe(1)
  })

  it('disables navigation buttons with disabled', () => {
    setup({
      position: 2,
      parts: () => [
        h(GsCarouselPrevious, { disabled: true }),
        h(GsCarouselNext, { disabled: true }),
      ],
    })
    expect(screen.getByRole('button', { name: 'Previous' })).toBeDisabled()
    expect(screen.getByRole('button', { name: 'Next' })).toBeDisabled()
  })

  it('shares its state through useCarousel()', async () => {
    const First = defineComponent({
      setup() {
        const carousel = useCarousel()
        const current = computed(() => carousel.items[carousel.position])
        return () =>
          h('button', { onClick: () => carousel.setPosition(0) }, `First (${current.value?.title})`)
      },
    })
    const { model, user } = setup({ position: 4, parts: () => h(First) })
    await user.click(screen.getByRole('button', { name: 'First (Image 5)' }))
    expect(model.value).toBe(0)
    expect(screen.getByRole('button', { name: 'First (Image 1)' })).toBeInTheDocument()
  })
})
