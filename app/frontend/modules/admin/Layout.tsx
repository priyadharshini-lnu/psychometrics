import React, { Suspense } from 'react'
import {
  createBrowserRouter, Navigate, Outlet, RouterProvider, useMatches,
} from 'react-router-dom'
import { useSelector } from 'react-redux'
import ErrorModal from '~/components/ErrorModal'
import { RootState } from '~/modules/admin/core/rootReducers'
import { SessionTimeoutModal } from '~/components/SessionTimeoutModal'
import { AdminShell } from '~/components/AdminShell'
import RouteErrorBoundary from '~/components/RouteErrorBoundary'
import { PageFallback } from '~/components/PageFallback'
import { usePageChunk } from '~/utils/usePageChunk'
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
const RoutedPage: React.FC = () => {
  const matches = useMatches()

  return (
    <RouteErrorBoundary resetKey={matches[matches.length - 1]?.id}>
      <Outlet />
    </RouteErrorBoundary>
  )
}

const Main: React.FC = () => {
  // Keyed by chunk: a page waiting on a download gets a fresh boundary, which React fills with the fallback.
  const chunk = usePageChunk(router.routes)

  return (
    <>
      <title>{I18n.t('admin.meta_title')}</title>
      <AdminShell ownedPathPrefixes={OWNED_PATH_PREFIXES} routes={router.routes}>
        <Suspense key={chunk} fallback={<PageFallback />}>
          <RoutedPage />
        </Suspense>
        {modals}
      </AdminShell>
    </>
  )
}

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
    children: [{ element: <AssessorGate />, children: assessorRoutes }],
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
