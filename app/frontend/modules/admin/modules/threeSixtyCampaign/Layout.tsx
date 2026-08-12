import React, { Suspense } from 'react'
import {
  createBrowserRouter, Outlet, RouterProvider, useLocation,
} from 'react-router-dom'
import { AdminShell } from '~/components/AdminShell'
import RouteErrorBoundary, { RouteErrorCard } from '~/components/RouteErrorBoundary'
import { PageFallback } from '~/components/PageFallback'
import settings from './settings'
import routes from './routes'

// No ownedPathPrefixes: this router owns only the campaign subtree, so every main-menu target needs a full load.
const Main: React.FC = () => (
  <AdminShell>
    <RouteErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </RouteErrorBoundary>
  </AdminShell>
)

// Reset (not remounted) on navigation: a key here would tear down the campaign page on every subnav click.
const CampaignPage: React.FC = () => {
  const { pathname } = useLocation()

  return (
    <RouteErrorBoundary resetKey={pathname}>
      {/* A page may still React.lazy inside itself; without this the nearest boundary would blank the whole shell. */}
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </RouteErrorBoundary>
  )
}

export const router = createBrowserRouter([
  {
    path: settings.urlPrefix,
    element: <CampaignPage />,
    errorElement: <RouteErrorCard />,
    hydrateFallbackElement: <PageFallback />,
    children: routes,
  },
  { path: '*', element: <Main /> },
])

export function Layout () {
  return (
    <Suspense fallback="loading...">
      <RouterProvider router={router} />
    </Suspense>
  )
}
