import { CampaignList } from './CampaignList'
import { Campaign } from './Campaign'
import { Profile } from './Profile'
import { ChangePassword } from './ChangePassword'
import { Insights } from './Insights'
import { UserAssessment } from './UserAssessment'
import { Assessment } from './Assessment'
import { AgileUserAssessment } from './AgileUserAssessment'
import { CheckingWizard } from './CheckingWizard'
import { Nomination } from './Nomination'
import { Evaluation } from './Evaluation'
import { Report } from './Report'
import { Anonym } from './Anonym'
import { Bookings } from './Bookings'
import MeetingRoom from './MeetingRoom'
import { MyPlan } from './idp/MyPlan'
import { InitialSteps } from './idp/InitialSteps'
import { DirectReportsList } from './idp/DirectReports/List'
import { DirectReportDetails } from './idp/DirectReports/Details'

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
    path: '/invites',
    main: Bookings,
  },
  {
    path: '/profile_details',
    main: Profile,
    exact: true,
  },
  {
    path: '/change_password',
    main: ChangePassword,
    exact: true,
  },
  {
    path: '/campaigns/:campaignId/insights',
    main: Insights,
    exact: true,
  },
  {
    path: '/user_assessments/:userAssessmentId',
    main: Assessment,
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
  {
    path: '/anonym/:assessmentKey',
    main: Anonym,
    exact: true,
  },
  {
    path: '/meet/:roomId',
    main: MeetingRoom,
    exact: true,
  },
  {
    path: '/idp/steps/:step',
    main: InitialSteps,
    exact: true,
  },
  {
    path: '/idp/my_plan',
    main: MyPlan,
    exact: true,
  },
  {
    path: '/idp/my_plan/:tab',
    main: MyPlan,
    exact: true,
  },
  {
    path: '/idp/direct_reports',
    main: DirectReportsList,
    exact: true,
  },
  {
    path: '/idp/direct_reports/:id',
    main: DirectReportDetails,
    exact: true,
  },
  {
    path: '/idp/direct_reports/:id/:tab',
    main: DirectReportDetails,
    exact: true,
  },
]

export default routes
