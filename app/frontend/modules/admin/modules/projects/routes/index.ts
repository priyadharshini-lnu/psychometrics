import { Project } from 'modules/admin/modules/client/routes/Client/routes/Project'
import { Campaign } from 'modules/admin/modules/campaigns/routes/Campaign'
import UsersAssessmentsReports
  from 'modules/admin/modules/campaigns/routes/Campaign/routes/Participants/Subjects/AssessmentsReports'
import AssessorsDetails
  from 'modules/admin/modules/campaigns/routes/Campaign/routes/Participants/Assessors/AssessorDetails'
import ReportPreview from 'modules/admin/modules/campaigns/routes/ReportPreview'

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
    path: '/:projectId/new_campaigns/:campaignId/users/:id',
    component: UsersAssessmentsReports,
  },
  {
    path: '/:projectId/new_campaigns/:campaignId/assessors/:id',
    component: AssessorsDetails,
  },
  {
    path: '/:projectId/new_campaigns/:campaignId/user_reports/:id',
    component: ReportPreview,
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
