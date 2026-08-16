import React, { Suspense } from 'react'
import {
  createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation,
} from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ErrorModal from '~/components/ErrorModal'
import { RootState } from '~/modules/admin/core/rootReducers'
import { SessionTimeoutModal } from '~/components/SessionTimeoutModal'
import { AdminShell } from '~/components/AdminShell'
import RouteErrorBoundary, { RouteErrorCard } from '~/components/RouteErrorBoundary'
import { PageFallback, PageHoldArea } from '~/components/PageFallback'
import routes from './routes'
import assessorRoutes from './modules/AssessorApp/routes'
import assessorSettings from './modules/AssessorApp/settings'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { DisplayExceptionModal } from '~/components/DisplayExceptionModal'

const { I18n } = window

const OWNED_PATH_PREFIXES = ['/admin', assessorSettings.urlPrefix]

const modals = (
  <>
    <IncorrectResponseErrorModal />
    <SessionTimeoutModal />
    <DisplayExceptionModal />
    <ErrorModal />
  </>
)

// The server no longer gates assessor page loads; the permission-gated menu link is the access signal here.
const AssessorGate: React.FC = () => {
  const links = useSelector((state: RootState) => state.ui.menu.links)

  if (!links.assessorDashboard) return <Navigate to="/admin" replace />

  return <Outlet />
}

// Reset (not remounted) on navigation: a key here would tear down the whole routed subtree on every click.
// The router holds the pending page until its chunk lands, so swapping the outlet for a skeleton would only
// unmount the page that is still on screen; the cold-start skeleton is hydrateFallbackElement below.
const RoutedPage: React.FC = () => {
  const { pathname } = useLocation()

  return (
    // Two urls can share one route id - `norms/1/editor` and `norms/2/editor` - so the url says the user moved on.
    <RouteErrorBoundary resetKey={pathname}>
      {/* Above every page's own chrome: a page waiting on data holds its tab strip back, not spins under it. */}
      <PageHoldArea>
        {/* A page may still React.lazy inside itself; the nearest boundary would blank the whole shell. */}
        <Suspense fallback={<PageFallback />}>
          <Outlet />
        </Suspense>
      </PageHoldArea>
    </RouteErrorBoundary>
  )
}

const Main: React.FC = () => (
  <>
    <title>{I18n.t('admin.meta_title')}</title>
    <AdminShell ownedPathPrefixes={OWNED_PATH_PREFIXES}>
      <Outlet />
      {modals}
    </AdminShell>
  </>
)

// A pathless layout: the shell above it survives both a failed page chunk and the first-load wait below it.
const pageArea = (children: RouteObject[]): RouteObject => ({
  element: <RoutedPage />,
  errorElement: <RouteErrorCard />,
  // No delay on a cold start: the splash has just been removed, so anything held back is a blank page.
  hydrateFallbackElement: <PageFallback delay={0} />,
  children,
})

export const router = createBrowserRouter([
  {
    path: '/admin/*',
    element: <Main />,
    children: [pageArea([
      {
        path: '',
        element: <Navigate to="clients" />,
      },
      ...routes,
    ])],
  },
  {
    path: `${assessorSettings.urlPrefix}/*`,
    element: <Main />,
    children: [pageArea([{ element: <AssessorGate />, children: assessorRoutes }])],
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
