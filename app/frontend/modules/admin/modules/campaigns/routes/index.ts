import CampaignList from './CampaignList'
import Campaign from './Campaign'
import UsersAssessmentsReports from './Campaign/routes/Users/AssessmentsReports'
import ReportPreview from './ReportPreview'

const routes = [
  {
    path: '/:campaignId/users/:id',
    component: UsersAssessmentsReports,
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
