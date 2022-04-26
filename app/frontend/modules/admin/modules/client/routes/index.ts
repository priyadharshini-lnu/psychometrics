import { Project } from 'modules/admin/modules/client/routes/Client/routes/Project'
import { Campaign } from 'modules/admin/modules/campaigns/routes/Campaign'
import UsersAssessmentsReports
  from 'modules/admin/modules/campaigns/routes/Campaign/routes/Participants/Subjects/AssessmentsReports'
import AssessorsDetails
  from 'modules/admin/modules/campaigns/routes/Campaign/routes/Participants/Assessors/AssessorDetails'
import ReportPreview from 'modules/admin/modules/campaigns/routes/ReportPreview'
import { Client } from './Client'
import { ClientList } from './ClientList'

export const routes = [
  {
    path: '/clients/',
    component: ClientList,
  },
  {
    path: '/clients/:clientId',
    component: Client,
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
