import { lazyPages } from '~/utils/lazyPages'
import { routes as campaignRoutes } from '~/modules/admin/modules/campaigns/routes/Campaign/routes'
import { routes as clientRoutes } from './Client/routes'
import { routes as projectRoutes } from './Client/routes/Project/routes'

const page = lazyPages('client', () => import('../pages'))
const campaignPage = lazyPages('campaigns', () => import('~/modules/admin/modules/campaigns/pages'))

const ClientList = page(m => m.ClientList)
const Client = page(m => m.Client)
const LicenseUsageList = page(m => m.LicenseUsageList)
const Project = page(m => m.Project)
const Campaign = page(m => m.Campaign)
const ReportPreview = campaignPage(m => m.ReportPreview)
const ExternalReportPreview = campaignPage(m => m.ExternalReportPreview)

const routes = [
  {
    path: 'clients',
    element: <ClientList />,
  },
  {
    path: 'clients/:clientId',
    element: <Client />,
    children: clientRoutes,
  },
  {
    path: 'clients/:clientId/licenses/:licenseId/license_usages',
    element: <LicenseUsageList />,
  },
  {
    path: 'projects/:projectId',
    element: <Project />,
    children: projectRoutes,
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
    // The splat stays because a threesixty campaign renders its own descendant Routes under this url.
    path: 'projects/:projectId/new_campaigns/:campaignId/*',
    element: <Campaign />,
    children: campaignRoutes,
  },
]

export default routes
