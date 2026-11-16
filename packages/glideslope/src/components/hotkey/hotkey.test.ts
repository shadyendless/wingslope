import { render, screen } from '@testing-library/vue'
import { describe, expect, it } from 'vite-plus/test'
import { defineComponent, h } from 'vue'
import { provideHotkeyDefaults } from './defaults'
import GsHotkey from './GsHotkey.vue'

describe('GsHotkey defaults', () => {
  it('defaults to the outline variant', () => {
    render(GsHotkey, { slots: { default: () => 'K' } })
    expect(screen.getByText('K')).toHaveClass('key', 'outline')
  })

  it('takes its variant from provided defaults, explicit variant wins', () => {
    const Parent = defineComponent({
      setup() {
        provideHotkeyDefaults({ variant: 'flat' })
        return () => [
          h(GsHotkey, null, () => 'Ctrl'),
          h(GsHotkey, { variant: 'outline' }, () => 'C'),
        ]
      },
    })
    render(Parent)
    expect(screen.getByText('Ctrl')).toHaveClass('key', 'flat')
    expect(screen.getByText('Ctrl')).not.toHaveClass('outline')
    expect(screen.getByText('C')).toHaveClass('key', 'outline')
  })
})
