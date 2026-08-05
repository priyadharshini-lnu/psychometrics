import React, { Suspense } from 'react'
import {
  createBrowserRouter, Outlet, RouterProvider, useMatches,
} from 'react-router-dom'
import { AdminShell } from '~/components/AdminShell'
import RouteErrorBoundary from '~/components/RouteErrorBoundary'
import { PageFallback } from '~/components/PageFallback'
import { usePageChunk } from '~/utils/usePageChunk'
import settings from './settings'
import routes from './routes'

// No ownedPathPrefixes: this router owns only the campaign subtree, so every main-menu target needs a full load.
const Main: React.FC = () => (
  <AdminShell>
    <Suspense fallback={<PageFallback />}>
      <Outlet />
    </Suspense>
  </AdminShell>
)

const CampaignPage: React.FC = () => {
  const matches = useMatches()
  // Keyed by chunk: a page waiting on a download gets a fresh boundary, which React fills with the fallback.
  const chunk = usePageChunk(router.routes)

  return (
    <RouteErrorBoundary key={matches[matches.length - 1]?.id}>
      <Suspense key={chunk} fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </RouteErrorBoundary>
  )
}

export const router = createBrowserRouter([
  { path: settings.urlPrefix, element: <CampaignPage />, children: routes },
  { path: '*', element: <Main /> },
])

export function Layout () {
  return (
    <Suspense fallback="loading...">
      <RouterProvider router={router} />
    </Suspense>
  )
}
