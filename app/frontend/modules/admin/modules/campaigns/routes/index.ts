import CampaignList from './CampaignList'
import Campaign from './Campaign'
import UsersAssessmentsReports from './Campaign/routes/Users/AssessmentsReports'

const routes = [
  {
    path: '/:campaignId/users/:id',
    component: UsersAssessmentsReports,
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
