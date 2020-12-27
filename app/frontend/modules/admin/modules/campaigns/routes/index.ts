import CampaignList from './CampaignList'
import Campaign from './Campaign'
import UsersAssessmentsReports from './Campaign/routes/Participants/Subjects/AssessmentsReports'
import AssessorsDetails from './Campaign/routes/Participants/Assessors/AssessorDetails'
import ReportPreview from './ReportPreview'

const routes = [
  {
    path: '/:campaignId/users/:id',
    component: UsersAssessmentsReports,
  },
  {
    path: '/:campaignId/assessors/:id',
    component: AssessorsDetails,
  },
  {
    path: '/:campaignId/user_reports/:id',
    component: ReportPreview,
  },
  {
    path: '/:campaignId',
    component: Campaign,
  },
  {
    path: '/:campaignId/*',
    component: Campaign,
  },
  {
    path: '/',
    component: CampaignList,
  },
]

export default routes
