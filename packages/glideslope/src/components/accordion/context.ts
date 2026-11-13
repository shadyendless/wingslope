import { inject, provide, type ComputedRef, type InjectionKey } from 'vue'
import type { GsAccordionVariant } from './types'

export interface AccordionGroupContext {
  variant: ComputedRef<GsAccordionVariant>
  disabled: ComputedRef<boolean>
}

export interface AccordionItemContext {
  variant: ComputedRef<GsAccordionVariant>
  disabled: ComputedRef<boolean>
}

const groupKey: InjectionKey<AccordionGroupContext> = Symbol('GsAccordionGroup')
const itemKey: InjectionKey<AccordionItemContext> = Symbol('GsAccordion')

export const provideAccordionGroup = (context: AccordionGroupContext) => provide(groupKey, context)
export const injectAccordionGroup = () => inject(groupKey, undefined)

export const provideAccordionItem = (context: AccordionItemContext) => provide(itemKey, context)
export const injectAccordionItem = () => inject(itemKey, undefined)
