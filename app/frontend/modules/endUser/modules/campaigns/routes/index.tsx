import { CampaignList } from './CampaignList'
import { Campaign } from './Campaign'
import { Profile } from './Profile'
import { Insights } from './Insights'
import { UserAssessment } from './UserAssessment'
import { AgileUserAssessment } from './AgileUserAssessment'
import { CheckingWizard } from './CheckingWizard'
import { Nomination } from './Nomination'
import { Evaluation } from './Evaluation'
import { Report } from './Report'

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
  {
    path: '/agile_user_assessments/:userAssessmentId',
    main: AgileUserAssessment,
    exact: true,
  },
  {
    path: '/system_checks/:assessmentId/:id',
    main: CheckingWizard,
    exact: true,
  },
  {
    path: '/threesixty_campaigns/:campaignId/nominations/:id',
    main: Nomination,
    exact: true,
  },
  {
    path: '/threesixty_campaigns/:campaignId/evaluations/:id',
    main: Evaluation,
    exact: true,
  },
  {
    path: '/threesixty_campaigns/:campaignId/reports/:id',
    main: Report,
    exact: true,
  },
]

export default routes
