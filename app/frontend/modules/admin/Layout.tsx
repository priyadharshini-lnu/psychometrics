import React, { Suspense } from 'react'
import {
  createBrowserRouter, Navigate, Outlet, RouterProvider, useLocation,
} from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { useSelector } from 'react-redux'
import ErrorModal from '~/components/ErrorModal'
import { RootState } from '~/modules/admin/core/rootReducers'
import { SessionTimeoutModal } from '~/components/SessionTimeoutModal'
import { AdminShell, AdminTheme } from '~/components/AdminShell'
import RouteErrorBoundary, { RouteErrorCard } from '~/components/RouteErrorBoundary'
import { PageFallback, PageHoldArea } from '~/components/PageFallback'
import routes from './routes'
import fullScreenRoutes from './routes/fullScreen'
import assessorRoutes from './modules/AssessorApp/routes'
import assessorSettings from './modules/AssessorApp/settings'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { DisplayExceptionModal } from '~/components/DisplayExceptionModal'
import { DocumentTitle } from '~/components/DocumentTitle'

const OWNED_PATH_PREFIXES = ['/admin', assessorSettings.urlPrefix]

const modals = (
  <>
    <IncorrectResponseErrorModal />
    <SessionTimeoutModal />
    <DisplayExceptionModal />
    <ErrorModal />
  </>
)

const AssessorGate: React.FC = () => {
  const links = useSelector((state: RootState) => state.ui.menu.links)

  if (!links.assessorDashboard) return <Navigate to="/admin" replace />

  return <Outlet />
}

const RoutedPage: React.FC = () => {
  const { pathname } = useLocation()

  return (
    // Two urls can share one route id - `norms/1/editor` and `norms/2/editor` - so the url says the user moved on.
    <RouteErrorBoundary resetKey={pathname}>
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
  <AdminShell ownedPathPrefixes={OWNED_PATH_PREFIXES}>
    <Outlet />
    {modals}
  </AdminShell>
)

const FullScreen: React.FC = () => (
  <>
    <Outlet />
    {modals}
  </>
)

const pageArea = (children: RouteObject[]): RouteObject => ({
  element: <RoutedPage />,
  errorElement: <RouteErrorCard />,
  // No delay on a cold start: the splash has just been removed, so anything held back is a blank page.
  hydrateFallbackElement: <PageFallback delay={0} />,
  children,
})

const ThemedRoot: React.FC = () => (
  <AdminTheme>
    <Outlet />
  </AdminTheme>
)

export const router = createBrowserRouter([
  {
    element: <ThemedRoot />,
    children: [
      { element: <FullScreen />, children: [pageArea(fullScreenRoutes)] },
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
    ],
  },
])

export function Layout () {
  return (
    <Suspense fallback="loading...">
      <DocumentTitle />
      <RouterProvider router={router} />
    </Suspense>
  )
}
