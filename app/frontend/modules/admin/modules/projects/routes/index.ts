import Project from '~/modules/admin/modules/client/routes/Client/routes/Project'
import Campaign from '~/modules/admin/modules/campaigns/routes/Campaign'
import ReportPreview from '~/modules/admin/modules/campaigns/routes/ReportPreview'
import ExternalReportPreview from '~/modules/admin/modules/campaigns/routes/ExternalReportPreview'

export const routes = [
  {
    path: '/:projectId',
    component: Project,
  },
  {
    path: '/:projectId/new_campaigns',
    component: Project,
  },
  {
    path: '/:projectId/new_campaigns/:campaignId/user_reports/:id',
    component: ReportPreview,
  },
  {
    path: '/:projectId/new_campaigns/:campaignId/external_user_report/:id',
    component: ExternalReportPreview,
  },
  {
    path: '/:projectId/new_campaigns/:campaignId',
    component: Campaign,
  },
  {
    path: '/:projectId/new_campaigns/:campaignId/*',
    component: Campaign,
  },
  {
    path: '/:projectId/*',
    component: Project,
  },
]
