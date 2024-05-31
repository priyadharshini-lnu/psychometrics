import React, { Suspense } from 'react'
import {
  createBrowserRouter, RouterProvider,
} from 'react-router-dom'
import { DefaultAntThemeWrapper, PageLoadSpinner } from '~/glint'
import RouteList from '~/components/RouteList'
import routes from './routes'

const Main: React.FC = () => (
  <Suspense fallback={(
    <DefaultAntThemeWrapper>
      <PageLoadSpinner size="large" />
    </DefaultAntThemeWrapper>
    )}
  >
    <RouteList routes={routes} urlPrefix="" />
  </Suspense>
)

export const router = createBrowserRouter([
  { path: '*', element: <Main /> },
])

export function Layout () {
  return <Suspense fallback="loading..."><RouterProvider router={router} /></Suspense>
}
