import React, { Suspense } from 'react'
import {
  createBrowserRouter, Navigate, Outlet, RouterProvider,
} from 'react-router-dom'
import ErrorModal from '~/components/ErrorModal'
import { SessionTimeoutModal } from '~/components/SessionTimeoutModal'
import { MainMenu } from '~/components/MainMenu'
import { DefaultAntThemeWrapper, PageLoadSpinner } from '~/glint'
import routes from './routes'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { DisplayExceptionModal } from '~/components/DisplayExceptionModal'

const { I18n } = window

const Main: React.FC = () => (
  <Suspense fallback={(
    <DefaultAntThemeWrapper>
      <PageLoadSpinner size="large" />
    </DefaultAntThemeWrapper>
    )}
  >
    <title>{I18n.t('admin.meta_title')}</title>
    <MainMenu />
    <Outlet />
    <IncorrectResponseErrorModal />
    <SessionTimeoutModal />
    <DisplayExceptionModal />
    <ErrorModal />
  </Suspense>
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
