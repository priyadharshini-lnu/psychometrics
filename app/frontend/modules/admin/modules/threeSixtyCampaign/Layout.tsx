import React, { Suspense } from 'react'
import {
  createBrowserRouter, Navigate, Outlet, RouterProvider,
} from 'react-router-dom'
import { AdminShell } from '~/components/AdminShell'
import { PageLoadSpinner } from '~/glint'
import settings from './settings'
import Participants from './routes/Participants'
import { Admins } from './routes/Admins'
import Datasheet from './routes/Datasheet'
import Reports from './routes/Reports'
import Messages from './routes/Messages'
import { AIArtifacts } from './routes/AIArtifacts'

// Boundary inside the shell so the fallback renders glint-themed and only the page area swaps.
// No ownedPathPrefixes: this router owns only the campaign subtree, so every main-menu target needs a full load.
const Main: React.FC = () => (
  <AdminShell>
    <Suspense fallback={<PageLoadSpinner size="large" />}>
      <Outlet />
    </Suspense>
  </AdminShell>
)

export const router = createBrowserRouter([
  { path: settings.urlPrefix, element: <Navigate to="participants" /> },
  {
    path: `${settings.urlPrefix}/participants/*`,
    element: <Participants />,
  },
  {
    path: `${settings.urlPrefix}/messages/*`,
    element: <Messages />,
  },
  {
    path: `${settings.urlPrefix}/admins/*`,
    element: <Admins />,
  },
  {
    path: `${settings.urlPrefix}/reports/*`,
    element: <Reports />,
  },
  {
    path: `${settings.urlPrefix}/datasheets/*`,
    element: <Datasheet />,
  },
  {
    path: `${settings.urlPrefix}/ai_artifacts/*`,
    element: <AIArtifacts />,
  },
  { path: '*', element: <Main /> },
])

export function Layout () {
  return <Suspense fallback="loading..."><RouterProvider router={router} /></Suspense>
}
