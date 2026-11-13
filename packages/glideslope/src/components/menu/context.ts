import {
  ContextMenuCheckboxItem,
  ContextMenuGroup,
  ContextMenuItem,
  ContextMenuLabel,
  ContextMenuPortal,
  ContextMenuRadioGroup,
  ContextMenuRadioItem,
  ContextMenuSeparator,
  ContextMenuSub,
  ContextMenuSubContent,
  ContextMenuSubTrigger,
  DropdownMenuCheckboxItem,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuRadioGroup,
  DropdownMenuRadioItem,
  DropdownMenuSeparator,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
} from 'reka-ui'
import { computed, inject, provide, type Component, type ComputedRef, type InjectionKey } from 'vue'
import type { GsMenuItemValue, GsMenuVariant } from './types'

/** Which Reka UI menu the items belong to: `GsMenu` (dropdown) or `GsContextMenu` (context). */
export type MenuKind = 'dropdown' | 'context'

export interface MenuContext {
  kind: MenuKind
  variant: ComputedRef<GsMenuVariant>
  /** Reports a chosen item's `value` to the menu's `action` event. */
  action: (value: GsMenuItemValue) => void
}

const key: InjectionKey<MenuContext> = Symbol('GsMenu')

export function provideMenuContext(context: MenuContext) {
  provide(key, context)
}

export function injectMenuContext(): MenuContext {
  return inject(key, {
    kind: 'dropdown',
    variant: computed(() => 'cozy' as const),
    action: () => {},
  })
}

/**
 * Reka UI's item parts for each kind of menu. Both sets wrap the same internal menu primitives, but
 * each root documents only its own parts, so items render the parts of the menu they are in.
 */
type MenuPart =
  | 'Item'
  | 'CheckboxItem'
  | 'RadioGroup'
  | 'RadioItem'
  | 'Group'
  | 'Label'
  | 'Separator'
  | 'Sub'
  | 'SubTrigger'
  | 'SubContent'
  | 'Portal'

// Annotated with plain `Component`s: the inferred type names Reka-internal types, which the
// library's declaration build can't reference. Items render these through `<component :is>`.
export const menuParts: Record<MenuKind, Record<MenuPart, Component>> = {
  dropdown: {
    Item: DropdownMenuItem,
    CheckboxItem: DropdownMenuCheckboxItem,
    RadioGroup: DropdownMenuRadioGroup,
    RadioItem: DropdownMenuRadioItem,
    Group: DropdownMenuGroup,
    Label: DropdownMenuLabel,
    Separator: DropdownMenuSeparator,
    Sub: DropdownMenuSub,
    SubTrigger: DropdownMenuSubTrigger,
    SubContent: DropdownMenuSubContent,
    Portal: DropdownMenuPortal,
  },
  context: {
    Item: ContextMenuItem,
    CheckboxItem: ContextMenuCheckboxItem,
    RadioGroup: ContextMenuRadioGroup,
    RadioItem: ContextMenuRadioItem,
    Group: ContextMenuGroup,
    Label: ContextMenuLabel,
    Separator: ContextMenuSeparator,
    Sub: ContextMenuSub,
    SubTrigger: ContextMenuSubTrigger,
    SubContent: ContextMenuSubContent,
    Portal: ContextMenuPortal,
  },
}
