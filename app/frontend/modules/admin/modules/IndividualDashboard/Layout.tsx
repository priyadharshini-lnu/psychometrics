import React, { Suspense } from 'react'
import {
  createBrowserRouter, Outlet, RouterProvider,
} from 'react-router-dom'
import { AdminShell, AdminTheme } from '~/components/AdminShell'
import RouteErrorBoundary from '~/components/RouteErrorBoundary'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { PageFallback } from '~/components/PageFallback'
import { settings } from './settings'
import { DashboardReport } from './routes/DashboardReport'

// No ownedPathPrefixes: this router owns only the dashboard route, so every main-menu target needs a full load.
const Main: React.FC = () => (
  <AdminShell>
    <RouteErrorBoundary>
      <Suspense fallback={<PageFallback />}>
        <Outlet />
      </Suspense>
    </RouteErrorBoundary>
    <IncorrectResponseErrorModal />
  </AdminShell>
)

// Inside the router because the theme reads the location, above every route so one provider covers them all.
const ThemedRoot: React.FC = () => (
  <AdminTheme>
    <Outlet />
  </AdminTheme>
)

export const router = createBrowserRouter([
  {
    element: <ThemedRoot />,
    children: [
      {
        path: settings.urlPrefix,
        element: <RouteErrorBoundary><DashboardReport /></RouteErrorBoundary>,
      },
      { path: '*', element: <Main /> },
    ],
  },
])

export function Layout () {
  return (
    <Suspense fallback="loading...">
      <RouterProvider router={router} />
    </Suspense>
  )
}
