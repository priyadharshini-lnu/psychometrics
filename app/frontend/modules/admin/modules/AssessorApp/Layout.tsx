import React, { Suspense } from 'react'
import { Layout as AntdLayout } from 'antd'
import {
  createBrowserRouter, Outlet, RouterProvider,
} from 'react-router-dom'
import { AdminShell } from '~/components/AdminShell'
import { PageLoadSpinner } from '~/glint'
import RouteList from '~/components/RouteList'
import routes from './routes'
import settings from './settings'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { DisplayExceptionModal } from '~/components/DisplayExceptionModal'
import { SessionTimeoutModal } from '~/components/SessionTimeoutModal'
import ErrorModal from '~/components/ErrorModal'


// Boundary inside the shell so the fallback renders glint-themed and only the page area swaps.
const Main: React.FC = () => (
  <AdminShell>
    <Suspense fallback={<PageLoadSpinner size="large" />}>
      <AntdLayout.Content>
        <Outlet />
        <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
      </AntdLayout.Content>
    </Suspense>
    <IncorrectResponseErrorModal />
    <DisplayExceptionModal />
    <SessionTimeoutModal />
    <ErrorModal />
  </AdminShell>
)

export const router = createBrowserRouter([
  { path: '*', element: <Main /> },
])

export function Layout () {
  return <Suspense fallback="loading..."><RouterProvider router={router} /></Suspense>
}
