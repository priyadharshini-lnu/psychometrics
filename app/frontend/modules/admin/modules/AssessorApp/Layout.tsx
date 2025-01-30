import React, { Suspense } from 'react'
import {
  createBrowserRouter, Outlet, RouterProvider,
} from 'react-router-dom'
import { PortalMenu } from '~/components/MainMenu'
import { DefaultAntThemeWrapper, PageLoadSpinner } from '~/glint'
import RouteList from '~/components/RouteList'
import routes from './routes'
import settings from './settings'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { DisplayExceptionModal } from '~/components/DisplayExceptionModal'
import { SessionTimeoutModal } from '~/components/SessionTimeoutModal'


const Main: React.FC = () => (
  <Suspense fallback={(
    <DefaultAntThemeWrapper>
      <PageLoadSpinner size="large" />
    </DefaultAntThemeWrapper>
    )}
  >
    <PortalMenu />
    <Outlet />
    <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
    <IncorrectResponseErrorModal />
    <DisplayExceptionModal />
    <SessionTimeoutModal />
  </Suspense>
)

export const router = createBrowserRouter([
  { path: '*', element: <Main /> },
])

export function Layout () {
  return <Suspense fallback="loading..."><RouterProvider router={router} /></Suspense>
}
