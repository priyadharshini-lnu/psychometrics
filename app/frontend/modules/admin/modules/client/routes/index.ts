import { lazy } from 'react'

const Project = lazy(() => import('~/modules/admin/modules/client/routes/Client/routes/Project'))
const Campaign = lazy(() => import('~/modules/admin/modules/campaigns/routes/Campaign'))
const ReportPreview = lazy(() => import('~/modules/admin/modules/campaigns/routes/ReportPreview'))
const ExternalReportPreview = lazy(() => import('~/modules/admin/modules/campaigns/routes/ExternalReportPreview'))
const Client = lazy(() => import('./Client'))
const ClientList = lazy(() => import('./ClientList'))
const LicenseList = lazy(() => import('./LicenseList'))
const LicenseUsageList = lazy(() => import('./LicenseList/LicenseUsage'))

export const routes = [
  { redirect: true, from: '/', to: '/clients' },
  {
    path: '/clients',
    component: ClientList,
  },
  {
    path: '/clients/:clientId',
    component: Client,
  },
  {
    path: '/clients/:clientId/licenses',
    component: LicenseList,
  },
  {
    path: '/clients/:clientId/licenses/:licenseId/license_usages',
    component: LicenseUsageList,
  },
  {
    path: '/clients/:clientId/*',
    component: Client,
  },
  {
    path: '/projects/:projectId',
    component: Project,
  },
  {
    path: '/projects/:projectId/new_campaigns',
    component: Project,
  },
  {
    path: '/projects/:projectId/new_campaigns/:campaignId/user_reports/:id',
    component: ReportPreview,
  },
  {
    path: '/projects/:projectId/new_campaigns/:campaignId/external_user_report/:id',
    component: ExternalReportPreview,
  },
  {
    path: '/projects/:projectId/new_campaigns/:campaignId',
    component: Campaign,
  },
  {
    path: '/projects/:projectId/new_campaigns/:campaignId/*',
    component: Campaign,
  },
  {
    path: '/projects/:projectId/*',
    component: Project,
  },
]
