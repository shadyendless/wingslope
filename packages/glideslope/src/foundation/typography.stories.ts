import type { Meta, StoryObj } from '@storybook/vue3-vite'

const meta = {
  title: 'Foundation/Typography',
  tags: ['!autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface TypographyInfo {
  name: string
  text: string
}

const headers: TypographyInfo[] = [
  {
    name: 'header-xxl (32/40)',
    text: 'text-header-xxl',
  },
  {
    name: 'header-xl (24/28)',
    text: 'text-header-xl',
  },
  {
    name: 'header-l (20/24)',
    text: 'text-header-l',
  },
  {
    name: 'header-m (14/20)',
    text: 'text-header-m',
  },
  {
    name: 'header-s (12/16)',
    text: 'text-header-s',
  },
  {
    name: 'header-xs (10/12)',
    text: 'text-header-xs',
  },
]

const body: TypographyInfo[] = [
  {
    name: 'body-l (16/24)',
    text: 'text-body-l',
  },
  {
    name: 'body-m (14/20)',
    text: 'text-body-m',
  },
  {
    name: 'body-s (12/16)',
    text: 'text-body-s',
  },
  {
    name: 'body-xs (10/12)',
    text: 'text-body-xs',
  },
  {
    name: 'body-xxs (9/12)',
    text: 'text-body-xxs',
  },
]

const bodyDisplay: TypographyInfo[] = [
  {
    name: 'body-l (16/24)',
    text: 'text-body-l',
  },
  {
    name: 'body-m (14/20)',
    text: 'text-body-m',
  },
  {
    name: 'body-s (12/16)',
    text: 'text-body-s',
  },
  {
    name: 'body-xs (10/12)',
    text: 'text-body-xs',
  },
]

const button: TypographyInfo[] = [
  {
    name: 'button-l (16/24)',
    text: 'text-button-l',
  },
  {
    name: 'button-m (14/20)',
    text: 'text-button-m',
  },
  {
    name: 'button-s (12/16)',
    text: 'text-button-s',
  },
  {
    name: 'button-xs (10/12)',
    text: 'text-button-xs',
  },
]

/** One row per text style: a sample set in the style, then its class and Figma name. */
const typographyRows = `
  <template v-for="typo in styles" :key="typo.name">
    <div :class="['fg-primary-bold text-right', typo.text]">{{ typo.name }}</div>
    <div class="fg-primary-bold flex flex-col gap-s font-display text-body-xs">
      <span class="inline-flex gap-s">{{ typo.text }}</span>
      <span class="fg-primary-muted">Figma: {{ typo.name }}</span>
    </div>
  </template>`

const sizeNote = `
  The numbers that you see in the parenthesis after each name is the font size and line height
  of each of the related entries.
  <br />
  <br />`

export const Fonts: Story = {
  render: () => ({
    template: `
      <div class="flex flex-col gap-xl">
        <div class="flex flex-col gap-m">
          <h1 class="fg-primary-bold text-header-xl">Fonts</h1>
          <p class="fg-primary-muted text-body-s">
            We use the Roboto Flex and Roboto Mono fonts as the basis for this design system.
          </p>
        </div>
        <div class="fg-primary-bold flex flex-col gap-y-oversized">
          <div class="flex flex-col font-primary">
            <h1 class="font-medium text-[48px] leading-[64px]">Roboto Flex</h1>
            <p class="font-normal text-[24px] leading-[32px]">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
              <br />
              abcdefghijklmnopqrstuvwxyz
              <br />
              0123456789
            </p>
          </div>
          <div class="flex flex-col font-display">
            <h1 class="font-medium text-[48px] leading-[64px]">Roboto Mono</h1>
            <p class="font-normal text-[24px] leading-[32px]">
              ABCDEFGHIJKLMNOPQRSTUVWXYZ
              <br />
              abcdefghijklmnopqrstuvwxyz
              <br />
              0123456789
            </p>
          </div>
        </div>
      </div>`,
  }),
}

export const PrimaryHeader: Story = {
  render: () => ({
    setup: () => ({ styles: headers }),
    template: `
      <div class="flex flex-col gap-xl">
        <div class="flex flex-col gap-m">
          <h1 class="fg-primary-bold text-header-xl">Headers</h1>
          <p class="fg-primary-muted text-body-s">
            ${sizeNote}
            The following includes the
            <span class="fg-accent-primary-bold font-display">font-primary</span> class as well.
            <br />
            <br />
            If you would like to make your headers uppercase, please use the
            <span class="fg-accent-primary-bold font-display">uppercase</span> class name instead
            of uppercase letters.
          </p>
        </div>
        <div class="grid grid-cols-2 items-center gap-x-xxl gap-y-xxl">${typographyRows}</div>
      </div>`,
  }),
}

export const PrimaryBody: Story = {
  render: () => ({
    setup: () => ({ styles: body }),
    template: `
      <div class="flex flex-col gap-xl">
        <div class="flex flex-col gap-m">
          <h1 class="fg-primary-bold text-header-xl">Body</h1>
          <p class="fg-primary-muted text-body-s">
            ${sizeNote}
            The following includes the
            <span class="fg-accent-primary-bold font-display">font-primary</span> class as well.
          </p>
        </div>
        <div class="grid grid-cols-2 items-center gap-x-xxl gap-y-xxl">${typographyRows}</div>
      </div>`,
  }),
}

export const DisplayBody: Story = {
  render: () => ({
    setup: () => ({ styles: bodyDisplay }),
    template: `
      <div class="flex flex-col gap-xl">
        <div class="flex flex-col gap-m">
          <h1 class="fg-primary-bold text-header-xl">Body</h1>
          <p class="fg-primary-muted text-body-s">
            ${sizeNote}
            The following includes the
            <span class="fg-accent-primary-bold font-display">font-display</span> class as well.
          </p>
        </div>
        <div class="grid grid-cols-2 items-center gap-x-xxl gap-y-xxl font-display">
          ${typographyRows}
        </div>
      </div>`,
  }),
}

export const PrimaryButton: Story = {
  render: () => ({
    setup: () => ({ styles: button }),
    template: `
      <div class="flex flex-col gap-xl">
        <div class="flex flex-col gap-m">
          <h1 class="fg-primary-bold text-header-xl">Button</h1>
          <p class="fg-primary-muted text-body-s">
            ${sizeNote}
            The following includes the
            <span class="fg-accent-primary-bold font-display">font-primary</span> class as well.
          </p>
        </div>
        <div class="grid grid-cols-2 items-center gap-x-xxl gap-y-xxl">${typographyRows}</div>
      </div>`,
  }),
}
