import {
  Controls,
  Description,
  DocsContainer,
  Primary,
  Subtitle,
  Title,
  type DocsContainerProps,
} from '@storybook/addon-docs/blocks'
import { withThemeByClassName } from '@storybook/addon-themes'
import type { Preview, VueRenderer } from '@storybook/vue3-vite'
import { Fragment, createElement } from 'react'
import { create } from 'storybook/theming'
import './preview.css'

/**
 * Storybook's docs pages are rendered by its own (React) docs theme, separately from the story
 * canvas. Match its backgrounds and fonts to Glideslope's surface tokens for each mode.
 */
const docsThemes = {
  dark: create({
    base: 'dark',
    appBg: '#151517',
    appContentBg: '#151517',
    appPreviewBg: '#151517',
    fontBase: '"Roboto Flex Variable", "Roboto Flex", sans-serif',
    fontCode: '"Roboto Mono Variable", "Roboto Mono", monospace',
  }),
  light: create({
    base: 'light',
    appBg: '#eff1f2',
    appContentBg: '#eff1f2',
    appPreviewBg: '#eff1f2',
    fontBase: '"Roboto Flex Variable", "Roboto Flex", sans-serif',
    fontCode: '"Roboto Mono Variable", "Roboto Mono", monospace',
  }),
}

/**
 * Generated docs pages show the description, the first story and its controls, like the Design
 * Toolkit's. Components with a written `*.docs.mdx` page use that instead.
 */
const docsPage = () =>
  createElement(
    Fragment,
    null,
    createElement(Title),
    createElement(Subtitle),
    createElement(Description),
    createElement(Primary),
    createElement(Controls),
  )

type DocsContainerWithGlobals = DocsContainerProps & {
  context: { store: { userGlobals: { globals: { theme?: string } } } }
}

const preview: Preview = {
  parameters: {
    layout: 'centered',
    // Glideslope paints the page background from its own tokens.
    backgrounds: { disable: true },
    controls: { expanded: true, sort: 'requiredFirst' },
    a11y: { test: 'error' },
    docs: {
      // Follow the toolbar's theme on docs pages too (the docs theme is otherwise always light).
      container: (props: DocsContainerWithGlobals) => {
        const mode = props.context.store.userGlobals.globals.theme === 'light' ? 'light' : 'dark'
        return createElement(DocsContainer, { ...props, theme: docsThemes[mode] })
      },
      page: docsPage,
      codePanel: true,
    },
    options: {
      storySort: {
        method: 'alphabetical',
        order: ['Foundation', 'Layout', 'Components'],
        locales: 'en-US',
      },
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
