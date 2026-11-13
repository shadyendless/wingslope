import { addons } from 'storybook/manager-api'
import { create } from 'storybook/theming'

// Follow the system color scheme for Storybook's own UI.
const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches

addons.setConfig({
  theme: create({
    base: prefersDark ? 'dark' : 'light',
    brandTitle: 'Glideslope',
  }),
})
