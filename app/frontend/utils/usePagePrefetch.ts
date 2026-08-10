import {
  useCallback, useEffect, useMemo, useRef,
} from 'react'
import { matchRoutes } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { pageOf } from './lazyPages'

// Long enough that sweeping the pointer down the rail to reach the last item downloads nothing on the way.
export const PREFETCH_DWELL = 100

export const preloadPage = (routes: RouteObject[], path: string) => {
  const matches = matchRoutes(routes, path.split(/[?#]/)[0]) || []

  matches.forEach(({ route }) => pageOf(route.element)?.preload())
}

/** Downloads the module behind a link once the pointer or focus has settled on it. */
export const usePagePrefetch = (routes?: RouteObject[]) => {
  const timer = useRef<ReturnType<typeof setTimeout>>()

  const cancel = useCallback(() => { clearTimeout(timer.current) }, [])

  useEffect(() => cancel, [cancel])

  const prefetch = useCallback((path?: string) => {
    cancel()
    if (!routes || !path) return

    timer.current = setTimeout(() => preloadPage(routes, path), PREFETCH_DWELL)
  }, [routes, cancel])

  return useMemo(() => ({ prefetch, cancel }), [prefetch, cancel])
}
