import { routes as campaignRoutes } from '~/modules/admin/modules/campaigns/routes/Campaign/routes'
import { lazyRoute } from '~/utils/lazyRoute'
import { routes as clientRoutes } from './Client/routes'
import { routes as projectRoutes } from './Client/routes/Project/routes'

const page = () => import('../pages')
// The report previews carry the reports engine, so they stay out of the campaign section's chunk.
const reportPreviewPage = () => import('~/modules/admin/modules/campaigns/routes/ReportPreview/pages')

const routes = [
  {
    path: 'clients',
    lazy: lazyRoute(page, m => m.ClientList),
  },
  {
    path: 'clients/:clientId',
    lazy: lazyRoute(page, m => m.Client),
    children: clientRoutes,
  },
  {
    path: 'clients/:clientId/licenses/:licenseId/license_usages',
    lazy: lazyRoute(page, m => m.LicenseUsageList),
  },
  {
    path: 'projects/:projectId',
    lazy: lazyRoute(page, m => m.Project),
    children: projectRoutes,
  },
  {
    path: 'projects/:projectId/new_campaigns/:campaignId/user_reports/:id',
    lazy: lazyRoute(reportPreviewPage, m => m.ReportPreview),
  },
  {
    path: 'projects/:projectId/new_campaigns/:campaignId/external_user_report/:id',
    lazy: lazyRoute(reportPreviewPage, m => m.ExternalReportPreview),
  },
  {
    // The splat stays because a threesixty campaign renders its own descendant Routes under this url.
    path: 'projects/:projectId/new_campaigns/:campaignId/*',
    lazy: lazyRoute(page, m => m.Campaign),
    children: campaignRoutes,
  },
]

export default routes
