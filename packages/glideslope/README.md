# @wingbrace/glideslope

Glideslope's Vue 3 component library, built on [Reka UI](https://reka-ui.com) primitives and styled by [`@wingbrace/glideslope-foundation`](../foundation).

## Usage

```bash
pnpm add @wingbrace/glideslope @wingbrace/glideslope-foundation tailwindcss @tailwindcss/vite \
  @fontsource-variable/roboto-flex @fontsource-variable/roboto-mono
```

```css
/* main.css: your Tailwind entry */
@import '@wingbrace/glideslope-foundation/styles';
@import '@wingbrace/glideslope/styles.css';
```

```vue
<!-- App.vue -->
<script setup lang="ts">
import { GsButton, GsIcon, provideTheme } from '@wingbrace/glideslope'
import { AddIcon } from '@wingbrace/glideslope-icons'

const theme = provideTheme({ defaultMode: 'dark' })
</script>

<template>
  <GsButton color="accent" @click="theme.toggleMode()">
    <GsIcon><AddIcon /></GsIcon>
    Toggle theme
  </GsButton>
</template>
```

- **Component styles** ship pre-compiled in `styles.css`, inside the `components.l1`–`l5` cascade layers. Any utility class you add (`<GsButton class="rounded-none">`) wins over them.
- **Types** expect `"moduleResolution": "bundler"` (the Vite default).
- **Tree-shaking:** components are plain named exports and tree-shake per component.

See [`apps/playground`](../../apps/playground) for a complete app.

## Components

### Basics

| Family           | Components                                                  | Built on                   |
| ---------------- | ----------------------------------------------------------- | -------------------------- |
| Avatar           | `GsAvatar`                                                  | Reka `Avatar`              |
| Badge            | `GsBadge`                                                   | —                          |
| Button           | `GsButton`, `GsLinkButton`, `GsToggleButton`                | Reka `Primitive`, `Toggle` |
| Details list     | `GsDetailsList`, `GsDetailsListLabel`, `GsDetailsListValue` | —                          |
| Divider          | `GsDivider`                                                 | Reka `Separator`           |
| Hero             | `GsHero`, `GsHeroTitle`, `GsHeroSubtitle`                   | —                          |
| Hotkey           | `GsHotkey`, `GsHotkeySet`                                   | —                          |
| Icon             | `GsIcon`                                                    | —                          |
| Label            | `GsLabel`                                                   | Reka `Label`, `FieldLabel` |
| Lines            | `GsLines`                                                   | —                          |
| Link             | `GsLink`                                                    | Reka `Primitive`           |
| Skeleton         | `GsSkeleton`                                                | —                          |
| Status indicator | `GsStatusIndicator`                                         | —                          |

### Forms

Labeled fields share one layout and use Reka UI's `FieldRoot`, so labels, descriptions, errors and validation (`required`, `validate`, `validation-mode`) are wired up the same way everywhere, including inside a Reka `FormRoot`.

| Family        | Components                                                                                            | Built on                                                           |
| ------------- | ----------------------------------------------------------------------------------------------------- | ------------------------------------------------------------------ |
| Input         | `GsInput`                                                                                             | Reka `FieldControl`                                                |
| Text fields   | `GsTextField`, `GsTextAreaField`, `GsSearchField`                                                     | Reka `FieldRoot`, `FieldControl`                                   |
| Checkbox      | `GsCheckbox`, `GsCheckboxGroup`                                                                       | Reka `Checkbox`                                                    |
| Radio         | `GsRadio`, `GsRadioGroup`                                                                             | Reka `RadioGroup`                                                  |
| Switch        | `GsSwitch`                                                                                            | Reka `Switch`                                                      |
| Slider        | `GsSlider`                                                                                            | Reka `Slider`                                                      |
| Options       | `GsOptions`, `GsOption`, `GsOptionSection`, `GsOptionLabel`, `GsOptionDescription`, `GsOptionContent` | Reka `Listbox` / `Select` / `Combobox` items                       |
| Select        | `GsSelectField`                                                                                       | Reka `Select`                                                      |
| Combo box     | `GsComboBoxField`                                                                                     | Reka `Combobox`                                                    |
| Date and time | `GsDateField`, `GsTimeField`                                                                          | Reka `DateField`, `TimeField`                                      |
| Chips         | `GsChip`, `GsChipList`, `GsSelectableChip`, `GsDeletableChip`                                         | Reka `TagGroup`                                                    |
| Color picker  | `GsColorPicker`, `GsCustomColorPicker`, `GsNoColorButton`                                             | Reka `ColorSwatchPicker`, `ColorArea`, `ColorSlider`, `ColorField` |

Field components send `class` and `style` to the field wrapper and every other attribute (`id`, `autocomplete`, `aria-*`, listeners) to the actual control. Date and time values are `@internationalized/date` objects.

### Overlays

Overlays take their trigger in a `#trigger` slot and their content in the default slot, which receives `close`. Bind `v-model:open` to control them. Attributes set on an overlay go to its trigger, so overlays can wrap each other: a `GsMenu` inside a `GsTooltip`'s `#trigger` gives one button both.

| Family  | Components                                                                                                                                                                                            | Built on                           |
| ------- | ----------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------------- |
| Tooltip | `GsTooltip`, `GsTooltipProvider`                                                                                                                                                                      | Reka `Tooltip`                     |
| Popover | `GsPopover`, `GsPopoverTitle`, `GsPopoverContent`, `GsPopoverFooter`, `GsPopoverClose`                                                                                                                | Reka `Popover`                     |
| Dialog  | `GsDialog`, `GsDialogTitle`, `GsDialogContent`, `GsDialogFooter`, `GsDialogClose`                                                                                                                     | Reka `Dialog`                      |
| Menu    | `GsMenu`, `GsContextMenu`, `GsMenuItem`, `GsMenuItemLabel`, `GsMenuItemDescription`, `GsMenuCheckboxItem`, `GsMenuRadioGroup`, `GsMenuRadioItem`, `GsMenuSection`, `GsMenuSeparator`, `GsMenuSubmenu` | Reka `DropdownMenu`, `ContextMenu` |
| Notice  | `GsNoticeList`, `GsNotice`, `GsNoticeIcon`, `useNotices()`                                                                                                                                            | Reka `Toast`                       |

Queue notices from anywhere with `useNotices().queue({ message, color, timeout })`; a `GsNoticeList` shows them. Lists with an `id` only show notices queued with that `target`.

### Navigation and collections

| Family      | Components                                                                                                                   | Built on                        |
| ----------- | ---------------------------------------------------------------------------------------------------------------------------- | ------------------------------- |
| Tabs        | `GsTabs`, `GsTabList`, `GsTab`, `GsTabPanel`                                                                                 | Reka `Tabs`                     |
| Accordion   | `GsAccordionGroup`, `GsAccordion`, `GsAccordionHeader`, `GsAccordionTrigger`, `GsAccordionPanel`                             | Reka `Accordion`                |
| Breadcrumbs | `GsBreadcrumbs`, `GsBreadcrumbItem`                                                                                          | —                               |
| Pagination  | `GsPagination`                                                                                                               | Reka `Pagination`               |
| Stepper     | `GsStepper`, `GsStepperList`, `GsStepperStep`, `GsStepperPanel`, `GsStepperBack`, `GsStepperNext`                            | Reka `Stepper`                  |
| Action bar  | `GsActionBar`                                                                                                                | —                               |
| List        | `GsList`, `GsListItem`, `GsListItemContent`, `GsListItemTitle`, `GsListItemDescription`                                      | Reka `TagGroup` (`role="grid"`) |
| Tree        | `GsTree`, `GsTreeItem`, `GsTreeItemLabel`, `GsTreeItemDescription`, `GsTreeItemPrefixIcon`, `GsTreeItemActions`, `useTree()` | Reka `Tree`                     |

`GsStepper` is unstyled, like the Design Toolkit's: steps are buttons you style with classes, using `data-current`, `data-visited` and `data-disabled` (e.g. `data-current:bg-accent-primary-bold`). Steps are identified by a `value`; `v-model` holds the current one and `v-model:completed` the visited ones.

`GsTree` is data-driven: pass `items` and render each row in the default slot. `useTree()` holds selection, expansion and visibility, with actions to insert, move and remove nodes. Drag-and-drop reordering isn't ported yet.

### Layout, data and media

| Family              | Components                                                                                                                                                                                                                                                                | Built on                     |
| ------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ---------------------------- |
| Table               | `GsTable`, `GsTableHeader`, `GsTableBody`, `GsTableRow`, `GsTableHeaderCell`, `GsTableCell`, `createTableColumnHelper`                                                                                                                                                    | `@tanstack/vue-table`        |
| Drawer              | `GsDrawerLayout`, `GsDrawerLayoutMain`, `GsDrawer`, `GsDrawerMenu`, `GsDrawerMenuItem`, `GsDrawerPanel`, `GsDrawerView`, `GsDrawerHeader`, `GsDrawerHeaderTitle`, `GsDrawerContent`, `GsDrawerFooter`, `GsDrawerTrigger`, `GsDrawerBack`, `GsDrawerClose`, `useDrawers()` | —                            |
| View stack          | `GsViewStack`, `GsViewStackView`, `GsViewStackTrigger`, `useViewStacks()`                                                                                                                                                                                                 | —                            |
| Sidenav             | `GsSidenav`, `GsSidenavTrigger`, `GsSidenavHeader`, `GsSidenavAvatar`, `GsSidenavContent`, `GsSidenavFooter`, `GsSidenavItem`, `GsSidenavLink`, `GsSidenavMenu`, `GsSidenavMenuItem`, `GsSidenavHeading`, `GsSidenavText`, `useSidenavs()`                                | Reka `Toggle`, `Collapsible` |
| Floating card       | `GsFloatingCardProvider`, `GsFloatingCard`, `useFloatingCard()`                                                                                                                                                                                                           | —                            |
| Carousel            | `GsCarousel`, `GsCarouselViewer`, `GsCarouselGallery`, `GsCarouselPrevious`, `GsCarouselNext`, `GsCarouselPosition`, `GsCarouselSelect`, `useCarousel()`                                                                                                                  | —                            |
| Media               | `GsAudio`, `GsVideo`, `GsMediaController`, `GsMediaControls`, `GsPlayButton`, `GsMuteButton`, `GsSeekButton`, `GsPlaybackRateButton`, `GsFullscreenButton`, `GsVolumeSlider`, `GsTimeRange`, `GsTimeDisplay`, `useMediaSelector()`, `useMediaDispatch()`                  | `media-chrome`               |
| Flashcard           | `GsFlashcard`, `GsFlashcardHero`, `GsFlashcardAdditionalData`, `GsFlashcardDetailsList`, `GsFlashcardDetailsLabel`, `GsFlashcardDetailsValue`                                                                                                                             | —                            |
| Clock               | `GsClock`                                                                                                                                                                                                                                                                 | —                            |
| Deferred collection | `GsDeferredCollection`, `useFrameDelay()`                                                                                                                                                                                                                                 | —                            |

### Planning, query and domain components

| Family           | Components                                                                                                                                                                                                                | Built on                  |
| ---------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------- | ------------------------- |
| Gantt            | `GsGantt`, `GsGanttPanelContainer`, `GsGanttPanelRow`, `GsGanttContentContainer`, `GsGanttContentRow`, `GsGanttBlock`, `GsGanttSpacer`, `GsGanttMarker`, `GsGanttIconMarker`, `GsGanttBracketOpen`, `GsGanttBracketClose` | —                         |
| Kanban           | `GsKanban`, `GsKanbanHeader`, `GsKanbanColumnContainer`, `GsKanbanColumn`, `GsKanbanColumnContent`, `GsKanbanCard`, `GsKanbanCardMoveMenu` and their header, title and action parts, `useKanban()`                        | `@dnd-kit/vue`            |
| Query builder    | `GsQueryBuilder`, `GsQueryBuilderCombinatorSelector`, `GsQueryBuilderCloneAction`, `GsQueryBuilderLockAction`, `GsQueryBuilderRemoveRuleAction`                                                                           | `@react-querybuilder/vue` |
| Coordinate field | `GsCoordinateField`, `useCoordinateField()` and its focus, paste and copy composables                                                                                                                                     | `@wingbrace/geo`          |
| Classification   | `GsClassificationBanner`, `GsClassificationBadge`                                                                                                                                                                         | —                         |

`GsTree` and `GsKanban` support drag-and-drop on `@dnd-kit/vue`, with keyboard dragging, screen-reader announcements and a way to move items without dragging (`useTree().moveStep()`, `GsKanbanCardMoveMenu`).

Drawers, view stacks and side navs can be controlled from anywhere by id with `useDrawers()`, `useViewStacks()` and `useSidenavs()` (e.g. `useDrawers().open('layers')`), in place of the Design Toolkit's `@accelint/bus` events. media-chrome loads lazily on the client, so importing Glideslope stays safe in server rendering and jsdom.

Composables: `provideTheme` / `useTheme`, `useNotices`, `useTree`, and `provide*Defaults` for the families whose defaults a parent can set, as the Design Toolkit's `*Provider` components do: Avatar, Badge, Button (and LinkButton, ToggleButton), Chip, ComboBoxField, DetailsList, Divider, Hotkey, Icon, Label, Link, SearchField, SelectField, Switch, Tab and Tabs, Table, TextAreaField, TextField, CoordinateField, ClassificationBadge, ClassificationBanner. For example, `provideButtonDefaults({ size: 'small' })`.

Components with inner parts take a `classes` prop (the Design Toolkit's `classNames`), e.g. `<GsTextField :classes="{ label: 'sr-only' }" />`; `class` always goes on the root.

## Development

```bash
pnpm storybook        # from the repo root; builds dependencies first
pnpm --filter @wingbrace/glideslope test
pnpm --filter @wingbrace/glideslope typecheck
pnpm --filter @wingbrace/glideslope build
```

Read the [component authoring guide](./AUTHORING.md) before adding or changing a component.
