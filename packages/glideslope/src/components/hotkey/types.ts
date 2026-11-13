export type GsHotkeyVariant = 'flat' | 'icon' | 'outline'

export interface GsHotkeyProps {
  /**
   * Visual style. When omitted, it comes from the nearest `provideHotkeyDefaults()`, falling back
   * to `outline`.
   */
  variant?: GsHotkeyVariant
}

/** Defaults a parent component can provide to every `GsHotkey` below it. */
export interface GsHotkeyDefaults {
  variant?: GsHotkeyVariant
}
