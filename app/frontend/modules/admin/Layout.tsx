import React, { Suspense } from 'react'
import {
  createBrowserRouter, Navigate, Outlet, RouterProvider, useMatches,
} from 'react-router-dom'
import ErrorModal from '~/components/ErrorModal'
import { SessionTimeoutModal } from '~/components/SessionTimeoutModal'
import { AdminShell } from '~/components/AdminShell'
import RouteErrorBoundary from '~/components/RouteErrorBoundary'
import { PageLoadSpinner } from '~/glint'
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

// Keyed by matched route so an error clears on navigation, as it did when every route carried its own boundary.
const RoutedPage: React.FC = () => {
  const matches = useMatches()

  return (
    <RouteErrorBoundary key={matches[matches.length - 1]?.id}>
      <Outlet />
    </RouteErrorBoundary>
  )
}

// AppShell owns the shell and the routed page is its child — only glint's Sider can theme the rail.
const Main: React.FC = () => (
  <>
    <title>{I18n.t('admin.meta_title')}</title>
    <AdminShell ownedPathPrefixes={OWNED_PATH_PREFIXES}>
      {/* Boundary inside the shell so a route chunk load swaps only the page area, never the shell. */}
      <Suspense fallback={<PageLoadSpinner size="large" />}>
        <RoutedPage />
      </Suspense>
      {modals}
    </AdminShell>
  </>
)

export const router = createBrowserRouter([
  {
    path: '/admin/*',
    element: <Main />,
    children: [
      {
        path: '',
        element: <Navigate to="clients" />,
      },
      ...routes,
    ],
  },
  {
    path: `${assessorSettings.urlPrefix}/*`,
    element: <Main />,
    children: assessorRoutes,
  },
  { path: '*', element: <Main /> },
])

export function Layout () {
  return <Suspense fallback="loading..."><RouterProvider router={router} /></Suspense>
}
