import { CampaignList } from './CampaignList'
import { Campaign } from './Campaign'
import { Profile } from './Profile'
import { Insights } from './Insights'
import { UserAssessment } from './UserAssessment'

const routes = [
  {
    path: '/',
    main: CampaignList,
    exact: true,
  },
  {
    path: '/dashboard',
    main: CampaignList,
    exact: true,
  },
  {
    path: '/campaigns/:campaignId',
    main: Campaign,
    exact: true,
  },
  {
    path: '/threesixty_campaigns/:campaignId',
    main: Campaign,
    exact: true,
  },
  {
    path: '/profile',
    main: Profile,
    exact: true,
  },
  {
    path: '/campaigns/:campaignId/insights',
    main: Insights,
    exact: true,
  },
  {
    path: '/user_assessments/:userAssessmentId/*',
    main: UserAssessment,
  },
]

export default routes
