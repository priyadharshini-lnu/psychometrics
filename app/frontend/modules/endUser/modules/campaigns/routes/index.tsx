import { useParams } from 'react-router-dom'
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
import { DirectReporteesList } from './idp/DirectReportees/List'
import { DirectReportDetails } from './idp/DirectReportees/Details'

const CWizard = () => {
  const { assessmentId, id } = useParams() as { assessmentId: string, id: string }
  return <CheckingWizard assessmentId={+assessmentId} userAssessmentId={+id} />
}

const routes = [
  {
    path: '/',
    component: <CampaignList />,
  },
  {
    path: '/dashboard',
    component: <CampaignList />,
  },
  {
    path: '/campaigns/:campaignId',
    component: <Campaign />,
  },
  {
    path: '/threesixty_campaigns/:campaignId',
    component: <Campaign />,
  },
  {
    path: '/invites/*',
    component: <Bookings />,
  },
  {
    path: '/profile_details',
    component: <Profile />,
  },
  {
    path: '/change_password',
    component: <ChangePassword />,
  },
  {
    path: '/campaigns/:campaignId/insights',
    component: <Insights />,
  },
  {
    path: '/user_assessments/:userAssessmentId',
    component: <Assessment />,
  },
  {
    path: '/user_assessments/:userAssessmentId/*',
    component: <UserAssessment />,
  },
  {
    path: '/agile_user_assessments/:userAssessmentId',
    component: <AgileUserAssessment />,
  },
  {
    path: '/system_checks/:assessmentId/:id',
    component: <CWizard />,
  },
  {
    path: '/threesixty_campaigns/:campaignId/nominations/:id',
    component: <Nomination />,
  },
  {
    path: '/threesixty_campaigns/:campaignId/evaluations/:id',
    component: <Evaluation />,
  },
  {
    path: '/threesixty_campaigns/:campaignId/reports/:id',
    component: <Report />,
  },
  {
    path: '/anonym/:assessmentKey',
    component: <Anonym />,
  },
  {
    path: '/meet/:roomId',
    component: <MeetingRoom />,
  },
  {
    path: '/idp/steps/:step',
    component: <InitialSteps />,
  },
  {
    path: '/idp/my_plan',
    component: <MyPlan />,
  },
  {
    path: '/idp/my_plan/:tab',
    component: <MyPlan />,
  },
  {
    path: '/idp/direct_reportees',
    component: <DirectReporteesList />,
  },
  {
    path: '/idp/direct_reportees/:userId',
    component: <DirectReportDetails />,
  },
  {
    path: '/idp/direct_reportees/:userId/:tab',
    component: <DirectReportDetails />,
  },
]

export default routes
