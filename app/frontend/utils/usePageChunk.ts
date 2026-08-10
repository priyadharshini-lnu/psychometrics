import { useMemo } from 'react'
import { matchRoutes, useLocation } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { pageOf } from './lazyPages'

// The chunk the matched page comes from, innermost first: a page only ever waits on its own download.
export const pageChunk = (routes: RouteObject[], pathname: string) => {
  const matches = matchRoutes(routes, pathname) || []

  return matches.reduceRight<string | undefined>((found, { route }) => found || pageOf(route.element)?.chunk, undefined)
}

export const usePageChunk = (routes: RouteObject[]) => {
  const { pathname } = useLocation()

  return useMemo(() => pageChunk(routes, pathname), [routes, pathname])
}
