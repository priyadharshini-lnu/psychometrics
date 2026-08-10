import { isValidElement, lazy } from 'react'
import type { ComponentType, ReactNode } from 'react'

export type PageComponent = ComponentType & { chunk: string, preload: () => void }

// Route splitting stops at the top-level module: every route below shares this one import, named by `chunk`.
export const lazyPages = <Module>(chunk: string, load: () => Promise<Module>) => {
  let pending: Promise<Module> | undefined

  // A failed load is dropped, so the next route reaching for this module imports it again.
  const start = () => {
    pending = pending || load().catch((error) => { pending = undefined; throw error })

    return pending
  }

  // A prefetch is only a hint: it swallows failure and leaves it to the render that really needs the module.
  const preload = () => { start().catch(() => {}) }

  return (pick: (module: Module) => ComponentType): PageComponent => Object.assign(
    lazy(async () => ({ default: pick(await start()) })),
    { chunk, preload },
  )
}

const isPageComponent = (value: unknown): value is PageComponent => (
  value != null && (typeof value === 'object' || typeof value === 'function')
  && 'chunk' in value && 'preload' in value
)

export const pageOf = (element: ReactNode): PageComponent | undefined => (
  isValidElement(element) && isPageComponent(element.type) ? element.type : undefined
)
