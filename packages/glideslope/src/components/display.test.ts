import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vitest'
import { defineComponent, h } from 'vue'
import GsAvatar from './avatar/GsAvatar.vue'
import GsBadge from './badge/GsBadge.vue'
import GsDetailsList from './details-list/GsDetailsList.vue'
import GsDetailsListLabel from './details-list/GsDetailsListLabel.vue'
import GsDetailsListValue from './details-list/GsDetailsListValue.vue'
import GsDivider from './divider/GsDivider.vue'
import GsHero from './hero/GsHero.vue'
import GsHeroSubtitle from './hero/GsHeroSubtitle.vue'
import GsHeroTitle from './hero/GsHeroTitle.vue'
import GsHotkey from './hotkey/GsHotkey.vue'
import GsHotkeySet from './hotkey/GsHotkeySet.vue'
import { provideIconDefaults } from './icon/defaults'
import GsIcon from './icon/GsIcon.vue'
import GsLabel from './label/GsLabel.vue'
import GsLines from './lines/GsLines.vue'
import GsLink from './link/GsLink.vue'
import GsSkeleton from './skeleton/GsSkeleton.vue'
import GsStatusIndicator from './status-indicator/GsStatusIndicator.vue'

describe('GsIcon', () => {
  it('defaults to medium', () => {
    render(GsIcon, { slots: { default: () => 'i' } })
    expect(screen.getByText('i')).toHaveAttribute('data-size', 'medium')
  })

  it('takes size and class from provided defaults, explicit size wins', () => {
    const Parent = defineComponent({
      setup() {
        provideIconDefaults({ size: 'xsmall', class: 'from-parent' })
        return () => [h(GsIcon, null, () => 'a'), h(GsIcon, { size: 'large' }, () => 'b')]
      },
    })
    render(Parent)
    expect(screen.getByText('a')).toHaveAttribute('data-size', 'xsmall')
    expect(screen.getByText('a')).toHaveClass('icon', 'from-parent')
    expect(screen.getByText('b')).toHaveAttribute('data-size', 'large')
  })
})

describe('GsLabel', () => {
  it('marks optional fields and links to its control', () => {
    render(GsLabel, { props: { for: 'email' }, slots: { default: () => 'Email' } })
    const label = screen.getByText('Email (optional)')
    expect(label.tagName).toBe('LABEL')
    expect(label).toHaveAttribute('for', 'email')
  })

  it('does not mark required fields', () => {
    render(GsLabel, { props: { required: true }, slots: { default: () => 'Email' } })
    expect(screen.getByText('Email')).toHaveAttribute('data-required')
    expect(screen.queryByText(/optional/)).toBeNull()
  })
})

describe('GsBadge', () => {
  it('renders a dot when empty', () => {
    const { container } = render(GsBadge)
    expect(container.querySelector('span')).toHaveAttribute('data-empty')
    expect(container.querySelector('span')).toHaveAttribute('data-color', 'info')
  })

  it('positions with placement and offset', () => {
    render(GsBadge, {
      props: { placement: 'top right', offset: { x: 2, y: 6 }, color: 'critical' },
      slots: { default: () => '3' },
    })
    const badge = screen.getByText('3')
    expect(badge).toHaveAttribute('data-placement', 'top right')
    expect(badge).not.toHaveAttribute('data-empty')
    expect(badge.style.getPropertyValue('--badge-offset-x')).toBe('2px')
    expect(badge.style.getPropertyValue('--badge-offset-y')).toBe('6px')
  })
})

describe('GsDivider', () => {
  it('is a horizontal separator by default', () => {
    render(GsDivider)
    expect(screen.getByRole('separator')).toHaveAttribute('data-orientation', 'horizontal')
  })

  it('announces vertical orientation', () => {
    render(GsDivider, { props: { orientation: 'vertical' } })
    expect(screen.getByRole('separator')).toHaveAttribute('aria-orientation', 'vertical')
  })

  it('can be purely decorative', () => {
    render(GsDivider, { props: { decorative: true } })
    expect(screen.queryByRole('separator')).toBeNull()
  })
})

describe('GsSkeleton', () => {
  it('is hidden from assistive technology', () => {
    const { container } = render(GsSkeleton, { props: { variant: 'circle' } })
    const el = container.firstElementChild
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).toHaveClass('skeleton', 'circle')
  })
})

describe('GsLink', () => {
  it('renders an anchor', () => {
    render(GsLink, { props: { href: '/docs' }, slots: { default: () => 'Docs' } })
    expect(screen.getByRole('link', { name: 'Docs' })).toHaveAttribute('href', '/docs')
  })

  it('drops the href while disabled', () => {
    render(GsLink, { props: { href: '/docs', disabled: true }, slots: { default: () => 'Docs' } })
    expect(screen.queryByRole('link')).toBeNull()
    expect(screen.getByText('Docs')).toHaveAttribute('aria-disabled', 'true')
  })
})

describe('GsAvatar', () => {
  it('exposes the alt text as its accessible name', () => {
    render(GsAvatar, { props: { alt: 'Jo Rivera' } })
    expect(screen.getByRole('img', { name: 'Jo Rivera' })).toHaveAttribute('data-size', 'medium')
  })

  it('shows the fallback slot when there is no image', async () => {
    render(GsAvatar, { props: { alt: 'Jo Rivera' }, slots: { fallback: () => 'JR' } })
    expect(await screen.findByText('JR')).toBeInTheDocument()
  })

  it('pins badges in its slot to the top-right corner', () => {
    render(GsAvatar, {
      props: { alt: 'Jo' },
      slots: { default: () => h(GsBadge, null, () => '2') },
    })
    const badge = screen.getByText('2')
    expect(badge).toHaveAttribute('data-placement', 'top right')
    expect(badge.style.getPropertyValue('--badge-offset-x')).toBe('4px')
  })
})

describe('GsHotkey', () => {
  it('renders keys as <kbd> and sizes icons in a set', () => {
    render(GsHotkeySet, {
      slots: { default: () => [h(GsHotkey, null, () => 'K'), h(GsIcon, null, () => 'i')] },
    })
    expect(screen.getByText('K').tagName).toBe('KBD')
    expect(screen.getByText('K')).toHaveClass('key', 'outline')
    expect(screen.getByText('i')).toHaveAttribute('data-size', 'large')
  })
})

describe('GsStatusIndicator', () => {
  it('names itself after the status when unlabeled', () => {
    render(GsStatusIndicator, { props: { status: 'poor' } })
    expect(screen.getByRole('img', { name: 'poor' })).toHaveAttribute('data-status', 'poor')
  })

  it('shows a visible label and hides the decorative shape', () => {
    const { container } = render(GsStatusIndicator, {
      props: { status: 'pending', label: 'Syncing' },
    })
    expect(screen.getByText('Syncing')).toBeInTheDocument()
    expect(screen.queryByRole('img')).toBeNull()
    expect(container.querySelector('[data-status="pending"]')).toHaveAttribute(
      'aria-hidden',
      'true',
    )
  })
})

describe('GsDetailsList', () => {
  it('renders a definition list with aligned labels and values', () => {
    render(GsDetailsList, {
      props: { align: 'center', classes: { value: 'extra' } },
      slots: {
        default: () => [
          h(GsDetailsListLabel, null, () => 'Callsign'),
          h(GsDetailsListValue, null, () => 'RAVEN 21'),
        ],
      },
    })
    const label = screen.getByText('Callsign')
    const value = screen.getByText('RAVEN 21')
    expect(label.tagName).toBe('DT')
    expect(value.tagName).toBe('DD')
    expect(label).toHaveClass('label', 'center')
    expect(value).toHaveClass('value', 'center', 'extra')
  })
})

describe('GsHero', () => {
  it('renders a header with a level-2 title and styled icon', () => {
    render(GsHero, {
      slots: {
        default: () => [
          h(GsIcon, null, () => 'i'),
          h(GsHeroTitle, null, () => 'No tracks'),
          h(GsHeroSubtitle, null, () => 'Select a track'),
        ],
      },
    })
    expect(screen.getByRole('banner')).toHaveAttribute('data-layout', 'stack')
    expect(screen.getByRole('heading', { level: 2, name: 'No tracks' })).toHaveClass('title')
    expect(screen.getByText('Select a track')).toHaveClass('subtitle')
    expect(screen.getByText('i')).toHaveAttribute('data-size', 'large')
    expect(screen.getByText('i')).toHaveClass('icon')
  })

  it('supports a compact layout and custom heading level', () => {
    render(GsHero, {
      props: { compact: true },
      slots: { default: () => h(GsHeroTitle, { level: 3 }, () => 'Compact') },
    })
    expect(screen.getByRole('banner')).toHaveAttribute('data-layout', 'grid')
    expect(screen.getByRole('heading', { level: 3 })).toBeInTheDocument()
  })
})

describe('GsLines', () => {
  it('is decorative and can hide while keeping its space', () => {
    const { container } = render(GsLines, { props: { variant: 'last', visible: false } })
    const el = container.firstElementChild
    expect(el).toHaveAttribute('aria-hidden', 'true')
    expect(el).toHaveAttribute('data-hidden')
    expect(el).toHaveClass('lines', 'last')
  })
})
