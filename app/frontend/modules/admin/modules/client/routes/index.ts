import { Project } from '~/modules/admin/modules/client/routes/Client/routes/Project'
import { Campaign } from '~/modules/admin/modules/campaigns/routes/Campaign'
import UsersAssessmentsReports
  from '~/modules/admin/modules/campaigns/routes/Campaign/routes/Participants/Subjects/AssessmentsReports'
import AssessorsDetails
  from '~/modules/admin/modules/campaigns/routes/Campaign/routes/Participants/Assessors/AssessorDetails'
import ReportPreview from '~/modules/admin/modules/campaigns/routes/ReportPreview'
import { ExternalReportPreview } from '~/modules/admin/modules/campaigns/routes/ExternalReportPreview'
import { Client } from './Client'
import { ClientList } from './ClientList'
import { LicenseList } from './LicenseList'
import { LicenseUsageList } from './LicenseList/LicenseUsage'

export const routes = [
  {
    path: '/',
    component: ClientList,
  },
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
    path: '/projects/:projectId/new_campaigns/:campaignId/users/:id',
    component: UsersAssessmentsReports,
  },
  {
    path: '/projects/:projectId/new_campaigns/:campaignId/assessors/:id',
    component: AssessorsDetails,
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
