/**
 * @internal Configures dnd-kit's Accessibility plugin for Glideslope's drag-and-drop components
 * (`GsTree`, `GsKanban`). The plugin gives every drag handle a description (the keyboard
 * instructions) and announces drags in a live region; its default announcements name items by
 * their dnd-kit ids, so components replace them with ones that use labels.
 */
import type {
  DragDropProviderProps,
  DragEndEvent,
  DragMoveEvent,
  DragOverEvent,
  DragStartEvent,
} from '@dnd-kit/vue'

/** Options of dnd-kit's Accessibility plugin. */
export interface DndAccessibilityOptions {
  /**
   * What the live region announces for each event. An event without a function, or a function
   * that returns `undefined`, announces nothing. `dragover` and `dragmove` announcements are
   * debounced.
   */
  announcements: {
    dragstart?: (event: DragStartEvent) => string | undefined
    dragmove?: (event: DragMoveEvent) => string | undefined
    dragover?: (event: DragOverEvent) => string | undefined
    dragend?: (event: DragEndEvent) => string | undefined
  }
  /** The description every drag handle points at with `aria-describedby`. */
  screenReaderInstructions: { draggable: string }
}

type PluginList = Extract<NonNullable<DragDropProviderProps['plugins']>, readonly unknown[]>

/**
 * A `plugins` value for `DragDropProvider`: dnd-kit's default plugins, with the Accessibility
 * plugin configured. `@dnd-kit/vue` doesn't export that plugin, so it is configured in place in
 * the defaults, which list it first (dnd-kit 0.5.3, pinned; the components' tests check the
 * instructions and announcements, so a reordering after an upgrade shows up there).
 */
export function withAccessibility(
  options: DndAccessibilityOptions,
): (defaults: PluginList) => PluginList {
  return (defaults) =>
    defaults.map((plugin, index) =>
      index === 0 && typeof plugin === 'function' ? { plugin, options } : plugin,
    )
}
