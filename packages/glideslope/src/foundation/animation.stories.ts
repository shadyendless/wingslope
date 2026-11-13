import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { designTokens } from '@wingbrace/glideslope-foundation/tokens'
import { defineComponent, onBeforeUnmount, ref } from 'vue'
import GsButton from '../components/button/GsButton.vue'

const meta = {
  title: 'Foundation/Animation',
  tags: ['!autodocs'],
} satisfies Meta

export default meta
type Story = StoryObj<typeof meta>

interface AnimationDurationInfo {
  name: string
  token: string
  useCase: string
}

interface AnimationEasingInfo {
  name: string
  token: string
  curve: string
  useCase: string
}

const durations: AnimationDurationInfo[] = [
  {
    name: 'Instant',
    token: 'animation-duration-instant',
    useCase: 'Immediate feedback, no visible animation',
  },
  {
    name: 'Fast',
    token: 'animation-duration-fast',
    useCase: 'Micro-interactions, hover states, button presses',
  },
  {
    name: 'Normal',
    token: 'animation-duration-normal',
    useCase: 'Most UI transitions, panel opens, content reveals',
  },
  {
    name: 'Slow',
    token: 'animation-duration-slow',
    useCase: 'Complex layout changes, large panels, page transitions',
  },
]

const curves = designTokens.animation.easing

const easings: AnimationEasingInfo[] = [
  {
    name: 'Standard',
    token: 'animation-easing-standard',
    curve: curves.standard,
    useCase: 'Default for most animations - balanced acceleration and deceleration',
  },
  {
    name: 'Decelerate',
    token: 'animation-easing-decelerate',
    curve: curves.decelerate,
    useCase: 'Elements entering the view - starts fast, ends slow',
  },
  {
    name: 'Accelerate',
    token: 'animation-easing-accelerate',
    curve: curves.accelerate,
    useCase: 'Elements leaving the view - starts slow, ends fast',
  },
]

/** Reads a token's value from the CSS variables on `<html>`. */
const cssVariable = (token: string) =>
  getComputedStyle(document.documentElement).getPropertyValue(`--${token}`).trim()

/**
 * A button that slides a dot `distance` pixels with the given `transition`, then slides it back
 * after `resetAfter` milliseconds. Clicks while it is moving are ignored.
 */
const AnimateDemo = defineComponent({
  components: { GsButton },
  props: {
    transition: { type: String, required: true },
    distance: { type: Number, required: true },
    resetAfter: { type: Number, required: true },
  },
  setup(props) {
    const isAnimating = ref(false)
    let timer: ReturnType<typeof setTimeout> | undefined

    const handleAnimate = () => {
      if (isAnimating.value) return
      isAnimating.value = true
      timer = setTimeout(() => (isAnimating.value = false), props.resetAfter)
    }
    onBeforeUnmount(() => clearTimeout(timer))

    return { isAnimating, handleAnimate }
  },
  template: `
    <div class="flex flex-col gap-m">
      <div class="flex flex-col gap-l">
        <GsButton variant="filled" color="mono-bold" @click="handleAnimate">Animate</GsButton>
        <div
          class="size-20 rounded-full bg-interactive-bold"
          :style="{
            transition,
            transform: isAnimating ? 'translateX(' + distance + 'px)' : 'translateX(0)',
            willChange: 'transform',
          }"
        />
      </div>
      <div class="fg-primary-bold flex flex-col gap-xs font-display text-body-xs">
        <slot />
      </div>
    </div>`,
})

export const Duration: Story = {
  render: () => ({
    components: { AnimateDemo },
    setup: () => ({
      durations: durations.map((duration) => {
        const computedValue = cssVariable(duration.token)
        return {
          ...duration,
          computedValue,
          transition: `transform var(--${duration.token}) var(--animation-easing-standard)`,
          // Use the computed duration for the reset timeout.
          resetAfter: (Number.parseInt(computedValue, 10) || 160) + 200,
        }
      }),
    }),
    template: `
      <div class="flex max-w-700 flex-col gap-xl p-xxl">
        <AnimateDemo
          v-for="duration in durations"
          :key="duration.token"
          :transition="duration.transition"
          :distance="200"
          :reset-after="duration.resetAfter"
        >
          <span class="inline-flex gap-s">
            {{ duration.name }}
            <span class="fg-primary-muted text-body-xxs">({{ duration.computedValue }})</span>
          </span>
          <span class="fg-primary-muted max-w-400 font-primary text-body-xs">
            {{ duration.useCase }}
          </span>
        </AnimateDemo>
      </div>`,
  }),
}

export const Easing: Story = {
  render: () => ({
    components: { AnimateDemo },
    setup: () => ({
      easings: easings.map((easing) => ({
        ...easing,
        transition: `transform var(--animation-duration-slow) var(--${easing.token})`,
      })),
    }),
    template: `
      <div class="flex max-w-700 flex-col gap-xl p-xxl">
        <!-- 320ms duration + 200ms buffer -->
        <AnimateDemo
          v-for="easing in easings"
          :key="easing.token"
          :transition="easing.transition"
          :distance="300"
          :reset-after="520"
        >
          <span>{{ easing.name }}</span>
          <span class="fg-primary-muted text-body-xxs">{{ easing.curve }}</span>
          <span class="fg-primary-muted max-w-400 font-primary text-body-xs">
            {{ easing.useCase }}
          </span>
        </AnimateDemo>
      </div>`,
  }),
}
