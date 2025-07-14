import { lazy } from 'react'
import Campaign from './Campaigns'

const Project = lazy(() => import('~/modules/admin/modules/client/routes/Client/routes/Project'))

const ReportPreview = lazy(() => import('~/modules/admin/modules/campaigns/routes/ReportPreview'))
const ExternalReportPreview = lazy(() => import('~/modules/admin/modules/campaigns/routes/ExternalReportPreview'))
const Client = lazy(() => import('./Client'))
const ClientList = lazy(() => import('./ClientList'))
const LicenseUsageList = lazy(() => import('./LicenseList/LicenseUsage'))

const routes = [
  {
    path: 'clients',
    element: <ClientList />,
  },
  {
    path: 'clients/:clientId',
    element: <Client />,
  },
  {
    path: 'clients/:clientId/licenses/:licenseId/license_usages',
    element: <LicenseUsageList />,
  },
  {
    path: 'clients/:clientId/*',
    element: <Client />,
  },
  {
    path: 'projects/:projectId',
    element: <Project />,
  },
  {
    path: 'projects/:projectId/new_campaigns/:campaignId/user_reports/:id',
    element: <ReportPreview />,
  },
  {
    path: 'projects/:projectId/new_campaigns/:campaignId/external_user_report/:id',
    element: <ExternalReportPreview />,
  },
  {
    path: 'projects/:projectId/new_campaigns/:campaignId/*',
    element: <Campaign />,
    // loader: async ({ request, params }) => fetch(
    //   `/administration/projects/${params.projectId}/new_campaigns/${params.campaignId}.json`,
    //   { signal: request.signal },
    // ),
  },
  {
    path: 'projects/:projectId/*',
    element: <Project />,
  },
]

export default routes
