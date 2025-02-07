import React, { Suspense } from 'react'
import {
  createBrowserRouter, Navigate, Outlet, RouterProvider,
} from 'react-router-dom'
import { MainMenu } from '~/components/MainMenu'
import { DefaultAntThemeWrapper, PageLoadSpinner } from '~/glint'
import RouteList from '~/components/RouteList'
import routes from './routes'
import settings from './settings'

// import Project from '~/modules/admin/modules/client/routes/Client/routes/Project'
// import { ProjectList } from '~/modules/admin/modules/client/routes/Client/routes/ProjectList'
// import { Admins } from '~/modules/admin/modules/client/routes/Client/routes/Admins'
// import { Settings } from '~/modules/admin/modules/client/routes/Client/routes/Settings'
import IncorrectResponseErrorModal from '~/components/IncorrectResponseErrorModal'
import { DisplayExceptionModal } from '~/components/DisplayExceptionModal'
// import { CampaignList } from '~/modules/admin/modules/campaigns/routes/CampaignList'

// const Campaign = lazy(() => import('~/modules/admin/modules/campaigns/routes/Campaign'))
// const ClientList = lazy(() => import('~/modules/admin/modules/client/routes/ClientList'))
// const Client = lazy(() => import('~/modules/admin/modules/client/routes/Client'))

const { I18n } = window

const Main: React.FC = () => (
  <Suspense fallback={(
    <DefaultAntThemeWrapper>
      <PageLoadSpinner size="large" />
    </DefaultAntThemeWrapper>
    )}
  >
    <title>{I18n.t('administration.meta_title')}</title>
    <MainMenu />
    <Outlet />
    <RouteList routes={routes} urlPrefix={settings.urlPrefix} />
    <IncorrectResponseErrorModal />
    <DisplayExceptionModal />
  </Suspense>
)

export const router = createBrowserRouter([
  // {
  //   path: '/admin/*',
  //   element: <Main />,
  //   children: [
  //     {
  //       path: '',
  //       element: <Navigate to="clients" />,
  //     },
  //     {
  //       path: 'clients/:clientId/*',
  //       element: <Client />,
  //       children: [
  //         {
  //           path: 'projects',
  //           element: <ProjectList />,
  //         },
  //         {
  //           path: 'admins',
  //           element: <Admins />,
  //         },
  //         {
  //           path: 'settings',
  //           element: <Settings />,
  //         },
  //       ],
  //     },
  //     {
  //       path: 'clients',
  //       element: <ClientList />,
  //     },
  //     {
  //       path: 'projects/:projectId',
  //       element: <Project />,
  //     },
  //     {
  //       path: 'projects/:projectId/new_campaigns',
  //       element: <CampaignList />,
  //     },
  //     {
  //       path: 'projects/:projectId/new_campaigns/:campaignId/*',
  //       element: <Campaign />,
  //     },
  //     {
  //       path: 'projects/:projectId/*',
  //       element: <Project />,
  //     },
  //   ],
  // },
  { path: '/admin', element: <Navigate to="clients" /> },
  { path: '*', element: <Main /> },
])

export function Layout () {
  return <Suspense fallback="loading..."><RouterProvider router={router} /></Suspense>
}
