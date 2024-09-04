import React, { Suspense } from 'react'
import {
  createBrowserRouter, Outlet, RouterProvider,
} from 'react-router-dom'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { DefaultAntThemeWrapper, PageLoadSpinner } from '~/glint'
import Dashboard from '~/modules/survey/layouts/Dashboard'
import Scoring from '~/modules/survey/layouts/Scoring'
import ResourceManager from '~/modules/survey/layouts/ResourceManager'

const Main: React.FC = () => (
  <Suspense fallback={(
    <DefaultAntThemeWrapper>
      <PageLoadSpinner size="large" />
    </DefaultAntThemeWrapper>
    )}
  >
    <Outlet />
    <IncorrectResponseErrorModal />
  </Suspense>
)

export const router = createBrowserRouter([
  { path: '/administration/assessments/:id', element: <Dashboard /> },
  { path: '/administration/assessments/:id/scoring', element: <Scoring /> },
  { path: '/administration/assessments/:id/resources', element: <ResourceManager /> },
  { path: '*', element: <Main /> },
])

export function Layout () {
  return <Suspense fallback="loading..."><RouterProvider router={router} /></Suspense>
}
