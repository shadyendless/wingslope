import type { Meta, StoryObj } from '@storybook/vue3-vite'
import { computed, ref } from 'vue'
import GsButton from '../button/GsButton.vue'
import GsInput from '../input/GsInput.vue'
import GsStepper from './GsStepper.vue'
import GsStepperBack from './GsStepperBack.vue'
import GsStepperList from './GsStepperList.vue'
import GsStepperNext from './GsStepperNext.vue'
import GsStepperPanel from './GsStepperPanel.vue'
import GsStepperStep from './GsStepperStep.vue'
import type { GsStepValue } from './types'

const components = {
  GsStepper,
  GsStepperList,
  GsStepperStep,
  GsStepperPanel,
  GsStepperBack,
  GsStepperNext,
  GsButton,
  GsInput,
}

// The stepper is unstyled; like the Design Toolkit's stories, these draw each step as a bar.
const card =
  'flex w-full flex-col gap-l rounded-medium bg-surface-raised p-l outline outline-static'
const bar =
  'h-[3px] w-full bg-surface-muted p-0 transition-colors data-current:bg-accent-primary-bold data-visited:bg-accent-primary-muted'

/**
 * Multi-step workflow component for wizards, forms, and onboarding.
 *
 * - **Controlled and uncontrolled:** bind `v-model` to the current step's value, or set
 *   `default-step`.
 * - **Validation:** block navigation with `before-step-change`.
 * - **Visited steps:** moving forward marks the step you leave as visited (`v-model:completed`).
 * - **Unstyled:** style the steps with `data-current`, `data-visited` and `data-disabled`.
 */
const meta = {
  title: 'Components/Stepper',
  component: GsStepper,
  parameters: {
    docs: { subtitle: 'Multi-step workflow component for wizards, forms, and onboarding' },
  },
} satisfies Meta<typeof GsStepper>

export default meta
type Story = StoryObj<typeof meta>

export const BasicLinear: Story = {
  render: () => ({
    components,
    setup: () => ({ card, bar }),
    template: `
      <div :class="card">
        <GsStepper default-step="personal-info">
          <GsStepperList aria-label="Checkout" class="mb-l flex gap-m">
            <GsStepperStep value="personal-info" :class="bar" />
            <GsStepperStep value="payment" :class="bar" />
            <GsStepperStep value="confirmation" :class="bar" />
          </GsStepperList>
          <div class="p-l">
            <GsStepperPanel value="personal-info">
              <h2 class="mb-m font-bold">Personal Information</h2>
              <p class="mb-l">Enter your personal details to continue.</p>
              <div class="mb-l flex flex-col gap-m">
                <GsInput type="text" placeholder="Full Name" aria-label="Full name" />
                <GsInput type="email" placeholder="Email" aria-label="Email" />
              </div>
              <div class="flex justify-end gap-m">
                <GsStepperBack class="px-l py-m">Back</GsStepperBack>
                <GsStepperNext class="px-l py-m">Next</GsStepperNext>
              </div>
            </GsStepperPanel>
            <GsStepperPanel value="payment">
              <h2 class="mb-m font-bold">Payment Details</h2>
              <p class="mb-l">Provide your payment information.</p>
              <div class="mb-l flex flex-col gap-m">
                <GsInput type="text" placeholder="Card Number" aria-label="Card number" />
                <div class="flex gap-m">
                  <GsInput type="text" placeholder="MM/YY" aria-label="Expiry date" />
                  <GsInput type="text" placeholder="CVV" aria-label="CVV" />
                </div>
              </div>
              <div class="flex justify-end gap-m">
                <GsStepperBack class="px-l py-m">Back</GsStepperBack>
                <GsStepperNext class="px-l py-m">Next</GsStepperNext>
              </div>
            </GsStepperPanel>
            <GsStepperPanel value="confirmation">
              <h2 class="mb-m font-bold">Confirmation</h2>
              <p class="mb-l">Review and confirm your order.</p>
              <div class="mb-l p-m">
                <p class="font-semibold">Order Summary</p>
                <p>Your information has been collected.</p>
              </div>
              <div class="flex justify-end gap-m">
                <GsStepperBack class="px-l py-m">Back</GsStepperBack>
                <GsButton class="px-l py-m">Submit</GsButton>
              </div>
            </GsStepperPanel>
          </div>
        </GsStepper>
      </div>`,
  }),
}

export const Controlled: Story = {
  render: () => ({
    components,
    setup: () => ({ card, bar, step: ref<GsStepValue>('step-1') }),
    template: `
      <div :class="card">
        <div class="p-m text-center">
          <p class="font-semibold">External State</p>
          <p>Current step: <code>{{ step }}</code></p>
        </div>
        <GsStepper v-model="step">
          <GsStepperList aria-label="Steps" class="mb-l flex gap-m">
            <GsStepperStep value="step-1" :class="bar" />
            <GsStepperStep value="step-2" :class="bar" />
            <GsStepperStep value="step-3" :class="bar" />
          </GsStepperList>
          <div class="p-l">
            <GsStepperPanel value="step-1">
              <h3 class="mb-m font-semibold">Step 1 Content</h3>
              <p class="mb-m">This is the first step in controlled mode.</p>
              <GsStepperNext class="px-l py-m">Next</GsStepperNext>
            </GsStepperPanel>
            <GsStepperPanel value="step-2">
              <h3 class="mb-m font-semibold">Step 2 Content</h3>
              <p class="mb-m">This is the second step.</p>
              <div class="flex gap-m">
                <GsStepperBack class="px-l py-m">Back</GsStepperBack>
                <GsStepperNext class="px-l py-m">Next</GsStepperNext>
              </div>
            </GsStepperPanel>
            <GsStepperPanel value="step-3">
              <h3 class="mb-m font-semibold">Step 3 Content</h3>
              <p class="mb-m">This is the final step.</p>
              <GsStepperBack class="px-l py-m">Back</GsStepperBack>
            </GsStepperPanel>
          </div>
        </GsStepper>
        <div class="flex justify-center gap-m">
          <GsButton @click="step = 'step-1'">Go to Step 1</GsButton>
          <GsButton @click="step = 'step-2'">Go to Step 2</GsButton>
          <GsButton @click="step = 'step-3'">Go to Step 3</GsButton>
        </div>
      </div>`,
  }),
}

/**
 * Validation blocking: `before-step-change` blocks navigation when the current step's
 * requirements aren't met.
 */
export const ValidationBlocking: Story = {
  render: () => ({
    components,
    setup: () => {
      const name = ref('')
      const email = ref('')
      const errorMessage = ref('')
      const beforeStepChange = (from: GsStepValue) => {
        errorMessage.value = ''
        if (from === 'step-1') {
          if (!name.value.trim()) {
            errorMessage.value = 'Name is required'
            return false
          }
          if (!(email.value.trim() && email.value.includes('@'))) {
            errorMessage.value = 'Valid email is required'
            return false
          }
        }
        return true
      }
      return { card, bar, name, email, errorMessage, beforeStepChange }
    },
    template: `
      <div :class="card">
        <div class="p-m">
          <p class="font-semibold">Validation Demo</p>
          <p>Try clicking Next without filling the form. Navigation will be blocked.</p>
        </div>
        <GsStepper default-step="step-1" :before-step-change="beforeStepChange">
          <GsStepperList aria-label="Steps" class="mb-l flex gap-m">
            <GsStepperStep value="step-1" :class="bar" />
            <GsStepperStep value="step-2" :class="bar" />
          </GsStepperList>
          <div class="p-l">
            <div v-if="errorMessage" role="alert" class="mb-m p-m">{{ errorMessage }}</div>
            <GsStepperPanel value="step-1">
              <h3 class="mb-m font-semibold">Required Information</h3>
              <div class="mb-l flex flex-col gap-m">
                <div>
                  <label for="name-input" class="mb-xs block">Name *</label>
                  <GsInput id="name-input" v-model="name" type="text" placeholder="Enter your name" />
                </div>
                <div>
                  <label for="email-input" class="mb-xs block">Email *</label>
                  <GsInput id="email-input" v-model="email" type="email" placeholder="Enter your email" />
                </div>
              </div>
              <GsStepperNext class="px-l py-m">Next</GsStepperNext>
            </GsStepperPanel>
            <GsStepperPanel value="step-2">
              <h3 class="mb-m font-semibold">Review</h3>
              <div class="mb-l p-m">
                <p><strong>Name:</strong> {{ name }}</p>
                <p><strong>Email:</strong> {{ email }}</p>
              </div>
              <GsStepperBack class="px-l py-m">Back</GsStepperBack>
            </GsStepperPanel>
          </div>
        </GsStepper>
      </div>`,
  }),
}

/**
 * Non-linear stepper with dynamic disabled steps. Steps become enabled based on completion of
 * previous steps, demonstrating conditional navigation.
 */
export const NonLinear: Story = {
  render: () => ({
    components,
    setup: () => {
      const completed = ref<GsStepValue[]>([])
      const disabledValues = computed(() => {
        const disabled = new Set<GsStepValue>()
        if (!completed.value.includes('step-1')) {
          disabled.add('step-2')
          disabled.add('step-3')
        }
        if (!completed.value.includes('step-2')) disabled.add('step-3')
        return [...disabled]
      })
      const complete = (step: GsStepValue) => {
        if (!completed.value.includes(step)) completed.value = [...completed.value, step]
      }
      return { card, bar, completed, disabledValues, complete }
    },
    template: `
      <div :class="card">
        <div class="p-m">
          <p class="font-semibold">Non-Linear Navigation</p>
          <p>Complete each step to unlock the next. Steps 2 and 3 are initially disabled.</p>
        </div>
        <GsStepper v-model:completed="completed" default-step="step-1" :disabled-values="disabledValues">
          <GsStepperList aria-label="Steps" class="mb-l flex gap-m">
            <GsStepperStep value="step-1" :class="bar" />
            <GsStepperStep value="step-2" :class="bar" />
            <GsStepperStep value="step-3" :class="bar" />
          </GsStepperList>
          <div class="p-l">
            <GsStepperPanel value="step-1">
              <h3 class="mb-m font-semibold">Step 1: Setup</h3>
              <p class="mb-l">Complete this step to unlock Step 2.</p>
              <GsButton class="px-l py-m" @click="complete('step-1')">Mark Complete</GsButton>
            </GsStepperPanel>
            <GsStepperPanel value="step-2">
              <h3 class="mb-m font-semibold">Step 2: Configuration</h3>
              <p class="mb-l">Complete this step to unlock Step 3.</p>
              <div class="flex gap-m">
                <GsStepperBack class="px-l py-m">Back</GsStepperBack>
                <GsButton class="px-l py-m" @click="complete('step-2')">Mark Complete</GsButton>
              </div>
            </GsStepperPanel>
            <GsStepperPanel value="step-3">
              <h3 class="mb-m font-semibold">Step 3: Finish</h3>
              <p class="mb-l">All steps completed!</p>
              <GsStepperBack class="px-l py-m">Back</GsStepperBack>
            </GsStepperPanel>
          </div>
        </GsStepper>
      </div>`,
  }),
}

/** Steps can hold labels instead of being drawn as bars; a step with content is named by it. */
export const WithLabels: Story = {
  render: () => ({
    components,
    setup: () => ({
      card,
      step: ref<GsStepValue>('details'),
      labelled:
        'flex-1 rounded-small px-s py-xs text-left fg-primary-muted data-current:bg-accent-primary-muted data-current:fg-primary-bold data-visited:fg-primary-bold data-disabled:fg-disabled',
    }),
    template: `
      <div :class="card">
        <GsStepper v-model="step">
          <GsStepperList aria-label="Mission setup" class="mb-l flex gap-m">
            <GsStepperStep value="details" :class="labelled">1. Details</GsStepperStep>
            <GsStepperStep value="assets" :class="labelled">2. Assets</GsStepperStep>
            <GsStepperStep value="review" :class="labelled">3. Review</GsStepperStep>
          </GsStepperList>
          <GsStepperPanel value="details" class="p-l">Name the mission.</GsStepperPanel>
          <GsStepperPanel value="assets" class="p-l">Assign aircraft and sensors.</GsStepperPanel>
          <GsStepperPanel value="review" class="p-l">Check everything, then submit.</GsStepperPanel>
          <div class="flex justify-end gap-m">
            <GsStepperBack class="px-l py-m">Back</GsStepperBack>
            <GsStepperNext class="px-l py-m">Next</GsStepperNext>
          </div>
        </GsStepper>
      </div>`,
  }),
}
