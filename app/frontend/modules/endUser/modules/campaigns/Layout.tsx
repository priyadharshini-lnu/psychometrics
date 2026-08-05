import React, { Suspense } from 'react'
import {
  createBrowserRouter, Outlet, RouterProvider, useMatches,
} from 'react-router-dom'
import { DefaultAntThemeWrapper, PageLoadSpinner } from '~/glint'
import RouteErrorBoundary from '~/components/RouteErrorBoundary'
import routes from './routes'

const Main: React.FC = () => {
  const matches = useMatches()

  return (
    <RouteErrorBoundary key={matches[matches.length - 1]?.id}>
      <Suspense fallback={(
        <DefaultAntThemeWrapper>
          <PageLoadSpinner size="large" />
        </DefaultAntThemeWrapper>
        )}
      >
        <Outlet />
      </Suspense>
    </RouteErrorBoundary>
  )
}

export const router = createBrowserRouter([
  { path: '/', element: <Main />, children: routes },
])

export function Layout () {
  return (
    <Suspense fallback="loading...">
      <RouterProvider router={router} />
    </Suspense>
  )
}
