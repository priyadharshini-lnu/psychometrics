import type { ComponentType } from 'react'

export const lazyRoute = <T>(
  load: () => Promise<T>,
  pick: (module: T) => ComponentType,
) => async () => ({ Component: pick(await load()) })
