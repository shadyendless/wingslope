import { render, screen, waitFor, within } from '@testing-library/vue'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { h, ref } from 'vue'
import { parseCoordinatePaste } from './coordinate-utils'
import type * as CoordinateUtils from './coordinate-utils'
import GsCoordinateField from './GsCoordinateField.vue'
import type { GsCoordinateValue, GsParsedCoordinateMatch } from './types'

// No real text parses as two different locations, so the paste parser is mocked to return two.
vi.mock('./coordinate-utils', async (importOriginal) => {
  const actual = await importOriginal<typeof CoordinateUtils>()
  return { ...actual, parseCoordinatePaste: vi.fn(actual.parseCoordinatePaste) }
})

const matches: GsParsedCoordinateMatch[] = [
  {
    format: 'dd',
    value: { lat: 40.7128, lon: -74.006 },
    displayString: '40.7128 N / 74.006 W',
  },
  {
    format: 'mgrs',
    value: { lat: 51.5074, lon: -0.1278 },
    displayString: '30U XC 99316 10163',
  },
]

function renderField() {
  const model = ref<GsCoordinateValue | null>(null)
  render(() =>
    h(GsCoordinateField, {
      label: 'Location',
      modelValue: model.value,
      'onUpdate:modelValue': (value: GsCoordinateValue | null) => (model.value = value),
    }),
  )
  return model
}

async function pasteAmbiguous() {
  const user = userEvent.setup()
  screen.getByLabelText('Latitude').focus()
  await user.paste('40.7128, -74.006')
  return { user, dialog: await screen.findByRole('dialog', { name: 'Select Coordinate Format' }) }
}

describe('GsCoordinateField paste disambiguation', () => {
  beforeEach(() => {
    vi.mocked(parseCoordinatePaste).mockReturnValueOnce(matches)
  })

  it('asks which system was meant when matches are different locations', async () => {
    renderField()
    const { dialog } = await pasteAmbiguous()
    const radios = within(dialog).getAllByRole('radio')
    expect(radios).toHaveLength(2)
    expect(radios[0]).toHaveAccessibleName(/Decimal Degrees/)
    expect(radios[0]).toHaveAttribute('aria-checked', 'true')
    expect(within(dialog).getByText('30U XC 99316 10163')).toBeInTheDocument()
  })

  it('applies the chosen interpretation', async () => {
    const model = renderField()
    const { user, dialog } = await pasteAmbiguous()
    await user.click(within(dialog).getByRole('radio', { name: /Military Grid Reference System/ }))
    await user.click(within(dialog).getByRole('button', { name: 'Apply Selected' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(model.value).toEqual({ lat: 51.5074, lon: -0.1278 })
    expect(screen.getByLabelText<HTMLInputElement>('Latitude').value).toBe('51.5074')
  })

  it('keeps the value when cancelled', async () => {
    const model = renderField()
    const { user, dialog } = await pasteAmbiguous()
    await user.click(within(dialog).getByRole('button', { name: 'Cancel' }))

    await waitFor(() => expect(screen.queryByRole('dialog')).toBeNull())
    expect(model.value).toBeNull()
  })
})
