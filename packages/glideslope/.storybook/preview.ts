import { withThemeByClassName } from '@storybook/addon-themes'
import type { Preview, VueRenderer } from '@storybook/vue3-vite'
import './preview.css'

const preview: Preview = {
  parameters: {
    layout: 'centered',
    // Glideslope paints the page background from its own tokens.
    backgrounds: { disable: true },
    controls: { expanded: true, sort: 'requiredFirst' },
    a11y: { test: 'error' },
    options: {
      storySort: { order: ['Foundation', 'Components'] },
    },
  },
  decorators: [
    withThemeByClassName<VueRenderer>({
      themes: { dark: 'dark', light: 'light' },
      defaultTheme: 'dark',
      parentSelector: 'html',
    }),
  ],
  tags: ['autodocs'],
}

export default preview
