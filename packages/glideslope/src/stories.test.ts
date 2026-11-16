/**
 * Renders every story once. Story templates are strings, so neither `vue-tsc` nor ESLint sees a
 * misspelled component, an unregistered component or a template error; this test does.
 */
import { composeStories, type composeStory } from '@storybook/vue3-vite'
import { cleanup, render } from '@testing-library/vue'
import { afterEach, describe, expect, it, vi } from 'vite-plus/test'

type StoryModule = Parameters<typeof composeStories>[0]
type ComposedStory = ReturnType<typeof composeStory>

const modules = import.meta.glob<StoryModule>('./**/*.stories.ts', { eager: true })

afterEach(() => {
  cleanup()
  vi.restoreAllMocks()
})

for (const [path, module] of Object.entries(modules)) {
  describe(path.replace('./', ''), () => {
    const stories = composeStories(module) as Record<string, ComposedStory>
    for (const [name, Story] of Object.entries(stories)) {
      it(name, async () => {
        const warnings: string[] = []
        vi.spyOn(console, 'warn').mockImplementation((...args: unknown[]) => {
          warnings.push(args.map(String).join(' '))
        })
        const errors: string[] = []
        vi.spyOn(console, 'error').mockImplementation((...args: unknown[]) => {
          errors.push(args.map(String).join(' '))
        })

        render(Story)
        await Story.play?.()

        expect(warnings.filter((w) => w.includes('[Vue warn]'))).toEqual([])
        expect(errors).toEqual([])
      })
    }
  })
}
