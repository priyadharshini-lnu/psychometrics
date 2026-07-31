import React, { Suspense } from 'react'
import {
  createBrowserRouter, Navigate, Outlet, RouterProvider,
} from 'react-router-dom'
import ErrorModal from '~/components/ErrorModal'
import { SessionTimeoutModal } from '~/components/SessionTimeoutModal'
import { AdminShell } from '~/components/AdminShell'
import { PageLoadSpinner } from '~/glint'
import routes from './routes'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { DisplayExceptionModal } from '~/components/DisplayExceptionModal'

const { I18n } = window

const OWNED_PATH_PREFIXES = ['/admin']

const modals = (
  <>
    <IncorrectResponseErrorModal />
    <SessionTimeoutModal />
    <DisplayExceptionModal />
    <ErrorModal />
  </>
)

// AppShell owns the shell and the routed page is its child — only glint's Sider can theme the rail.
const Main: React.FC = () => (
  <>
    <title>{I18n.t('admin.meta_title')}</title>
    <AdminShell ownedPathPrefixes={OWNED_PATH_PREFIXES}>
      {/* Boundary inside the shell so a route chunk load swaps only the page area, never the shell. */}
      <Suspense fallback={<PageLoadSpinner size="large" />}>
        <Outlet />
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
  { path: '*', element: <Main /> },
])

export function Layout () {
  return <Suspense fallback="loading..."><RouterProvider router={router} /></Suspense>
}
