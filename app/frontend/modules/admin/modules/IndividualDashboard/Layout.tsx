import React, { Suspense } from 'react'
import {
  createBrowserRouter, Outlet, RouterProvider,
} from 'react-router-dom'
import { AdminShell } from '~/components/AdminShell'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { PageLoadSpinner } from '~/glint'
import { settings } from './settings'
import { DashboardReport } from './routes/DashboardReport'

// Boundary inside the shell so the fallback renders glint-themed and only the page area swaps.
// No ownedPathPrefixes: this router owns only the dashboard route, so every main-menu target needs a full load.
const Main: React.FC = () => (
  <AdminShell>
    <Suspense fallback={<PageLoadSpinner size="large" />}>
      <Outlet />
    </Suspense>
    <IncorrectResponseErrorModal />
  </AdminShell>
)

export const router = createBrowserRouter([
  {
    path: settings.urlPrefix,
    element: <DashboardReport />,
  },
  { path: '*', element: <Main /> },
])

export function Layout () {
  return <Suspense fallback="loading..."><RouterProvider router={router} /></Suspense>
}
