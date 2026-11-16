/** @internal The row virtualizer of `GsGanttPanelContainer`. See `./rows-virtualizer.ts`. */
import { defineComponent } from 'vue'
import { useRowsVirtualizerRoot } from './rows-virtualizer'

export default defineComponent({
  name: 'GsGanttPanelRowsVirtualizer',
  setup(_, { slots }) {
    const root = useRowsVirtualizerRoot()

    return () => root.render(slots.default?.() ?? [], { role: 'list' })
  },
})
