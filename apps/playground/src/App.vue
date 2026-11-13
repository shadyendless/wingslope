<script setup lang="ts">
import {
  GsAvatar,
  GsBadge,
  GsButton,
  GsDetailsList,
  GsDetailsListLabel,
  GsDetailsListValue,
  GsDivider,
  GsHero,
  GsHeroSubtitle,
  GsHeroTitle,
  GsHotkey,
  GsHotkeySet,
  GsIcon,
  GsLabel,
  GsLink,
  GsLinkButton,
  GsSkeleton,
  GsStatusIndicator,
  GsToggleButton,
  provideButtonDefaults,
  provideTheme,
  type GsStatus,
} from '@wingbrace/glideslope'
import { AddIcon, BellIcon, BrightnessIcon, PinIcon, RadarIcon } from '@wingbrace/glideslope-icons'
import { computed, ref } from 'vue'
import FormsPanel from './FormsPanel.vue'
import TokenSwatch from './TokenSwatch.vue'

const theme = provideTheme({ defaultMode: 'dark' })

const pinned = ref(false)
const clicks = ref(0)
const loading = ref(true)
const statuses: GsStatus[] = ['good', 'degraded', 'poor', 'pending', 'unknown']

// Every GsButton below this component defaults to small, unless it says otherwise.
provideButtonDefaults({ size: 'small' })

const modeLabel = computed(() => (theme.mode.value === 'dark' ? 'Light mode' : 'Dark mode'))
</script>

<template>
  <div class="mx-auto flex flex-col gap-xl p-xl" style="max-width: 960px">
    <header class="flex items-center justify-between">
      <h1 class="text-header-xl">Glideslope playground</h1>
      <div class="flex items-center gap-s">
        <span class="relative inline-flex">
          <GsIcon size="large"><BellIcon /></GsIcon>
          <GsBadge placement="top right" color="critical" />
        </span>
        <GsAvatar alt="Jo Rivera">
          <template #fallback>JR</template>
          <GsBadge color="normal" />
        </GsAvatar>
        <GsButton variant="outline" @click="theme.toggleMode()">
          <GsIcon><BrightnessIcon /></GsIcon>{{ modeLabel }}
        </GsButton>
      </div>
    </header>

    <GsHero>
      <GsIcon><RadarIcon /></GsIcon>
      <GsHeroTitle>Consuming the built packages</GsHeroTitle>
      <GsHeroSubtitle>
        This app imports `@wingbrace/glideslope` from its `dist` output, styles from
        `glideslope.css`, and tokens from the foundation, exactly as an external app would.
      </GsHeroSubtitle>
    </GsHero>

    <section class="flex flex-col gap-m">
      <h2 class="text-header-l">Buttons</h2>
      <div class="flex flex-wrap items-center gap-s">
        <GsButton color="accent" @click="clicks++">
          <GsIcon><AddIcon /></GsIcon>Clicked {{ clicks }} times
        </GsButton>
        <GsButton color="critical" variant="flat">Flat critical</GsButton>
        <GsButton size="large">Explicit large</GsButton>
        <GsButton disabled>Disabled</GsButton>
        <GsToggleButton v-model="pinned" variant="outline">
          <GsIcon><PinIcon /></GsIcon>{{ pinned ? 'Pinned' : 'Pin' }}
        </GsToggleButton>
        <GsLinkButton href="#buttons" variant="flat">Link button</GsLinkButton>
      </div>
      <p class="text-body-s fg-primary-muted">
        Utility classes override component styles because they sit in a higher cascade layer:
      </p>
      <div class="flex gap-s">
        <GsButton color="accent" class="rounded-none">rounded-none</GsButton>
        <GsButton color="accent" class="bg-normal-bold">bg-normal-bold</GsButton>
      </div>
    </section>

    <GsDivider />

    <div class="grid grid-cols-2 gap-xl">
      <section class="flex flex-col gap-m">
        <h2 class="text-header-l">Track details</h2>
        <GsDetailsList align="justify">
          <GsDetailsListLabel>Callsign</GsDetailsListLabel>
          <GsDetailsListValue>RAVEN 21</GsDetailsListValue>
          <GsDetailsListLabel>Altitude</GsDetailsListLabel>
          <GsDetailsListValue>24,000 ft</GsDetailsListValue>
          <GsDetailsListLabel>Heading</GsDetailsListLabel>
          <GsDetailsListValue>274°</GsDetailsListValue>
        </GsDetailsList>
        <div class="flex flex-col gap-xs">
          <GsLabel for="notes" required>Notes</GsLabel>
          <GsLabel for="tags">Tags</GsLabel>
        </div>
        <p class="text-body-m">
          See the <GsLink href="#docs">operator guide</GsLink> or press
          <GsHotkeySet class="inline-flex">
            <GsHotkey>Ctrl</GsHotkey>+<GsHotkey>K</GsHotkey>
          </GsHotkeySet>
        </p>
      </section>

      <section class="flex flex-col gap-m">
        <h2 class="text-header-l">Status</h2>
        <GsStatusIndicator v-for="s in statuses" :key="s" :status="s" :label="s" />
        <div class="flex items-center gap-s">
          <GsButton variant="flat" @click="loading = !loading">Toggle loading</GsButton>
        </div>
        <div v-if="loading" class="flex flex-col gap-xs text-body-m">
          <GsSkeleton />
          <GsSkeleton />
        </div>
        <p v-else class="text-body-m">Loaded content.</p>
      </section>
    </div>

    <GsDivider />

    <FormsPanel />

    <GsDivider />

    <section class="flex flex-col gap-m">
      <h2 class="text-header-l">Theme tokens in JavaScript</h2>
      <p class="text-body-s fg-primary-muted">
        `useTheme().tokens` gives RGBA tuples for canvas and WebGL (deck.gl) rendering. These
        swatches are drawn on a canvas and follow the theme.
      </p>
      <TokenSwatch />
    </section>
  </div>
</template>
