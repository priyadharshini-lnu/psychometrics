import React, { Suspense } from 'react'
import {
  createBrowserRouter, Outlet, RouterProvider,
} from 'react-router-dom'
import { PortalMenu } from '~/components/MainMenu'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { DefaultAntThemeWrapper, PageLoadSpinner } from '~/glint'
import { settings } from './settings'
import { DashboardReport } from './routes/DashboardReport'

const Main: React.FC = () => (
  <Suspense fallback={(
    <DefaultAntThemeWrapper>
      <PageLoadSpinner size="large" />
    </DefaultAntThemeWrapper>
    )}
  >
    <PortalMenu />
    <Outlet />
    <IncorrectResponseErrorModal />
  </Suspense>
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
