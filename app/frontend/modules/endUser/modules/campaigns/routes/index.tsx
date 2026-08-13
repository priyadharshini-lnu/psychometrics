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
import { routes as bookingsRoutes } from './Bookings/routes'
import MeetingRoom from './MeetingRoom'
import { MyPlan } from './idp/MyPlan'
import { InitialSteps } from './idp/InitialSteps'
import { ReflectiveQuestions } from './idp/ReflectiveQuestions'
import { DirectReporteesList } from './idp/DirectReportees/List'
import { DirectReportDetails } from './idp/DirectReportees/Details'
import { AIStartPage } from './idp/AIAssistant/AIStartPage'
import { AIChat } from './idp/AIAssistant/AIChat'
import { SkillGapReport } from './idp/AIAssistant/SkillGapReport'
import { SystemChecksStepper } from './Campaign/CampaignLevelSystemChecks/SystemChecksStepper'
import { Welcome as CampaignLevelSystemChecksWelcome } from './Campaign/CampaignLevelSystemChecks/Welcome'
import { ChatInstructions } from './idp/AIAssistant/ChatInstructions'

const CWizard = () => {
  const { assessmentId, id } = useParams() as { assessmentId: string, id: string }
  return <CheckingWizard assessmentId={+assessmentId} userAssessmentId={+id} />
}

const routes = [
  {
    index: true,
    element: <CampaignList />,
  },
  {
    path: 'dashboard',
    element: <CampaignList />,
  },
  {
    path: 'campaigns/:campaignId',
    element: <Campaign />,
  },
  {
    path: 'campaign_system_check/:campaignId/welcome',
    element: <CampaignLevelSystemChecksWelcome />,
  },
  {
    path: 'campaign_system_check/:campaignId/:step',
    element: <SystemChecksStepper />,
  },
  {
    path: 'threesixty_campaigns/:campaignId',
    element: <Campaign />,
  },
  {
    path: 'invites',
    element: <Bookings />,
    children: bookingsRoutes,
  },
  {
    path: 'profile_details',
    element: <Profile />,
  },
  {
    path: 'change_password',
    element: <ChangePassword />,
  },
  {
    path: 'campaigns/:campaignId/insights',
    element: <Insights />,
  },
  {
    path: 'user_assessments/:userAssessmentId',
    element: <Assessment />,
  },
  {
    // A leaf splat: the player owns every url below itself, it does not match them.
    path: 'user_assessments/:userAssessmentId/*',
    element: <UserAssessment />,
  },
  {
    path: 'agile_user_assessments/:userAssessmentId',
    element: <AgileUserAssessment />,
  },
  {
    path: 'system_checks/:assessmentId/:id',
    element: <CWizard />,
  },
  {
    path: 'threesixty_campaigns/:campaignId/nominations/:id',
    element: <Nomination />,
  },
  {
    path: 'threesixty_campaigns/:campaignId/evaluations/:id',
    element: <Evaluation />,
  },
  {
    path: 'threesixty_campaigns/:campaignId/reports/:id',
    element: <Report />,
  },
  {
    path: 'anonym/:assessmentKey',
    element: <Anonym />,
  },
  {
    path: 'meet/:roomId',
    element: <MeetingRoom />,
  },
  {
    path: 'idp/ai_assistant/start',
    element: <AIStartPage />,
  },
  {
    path: 'idp/ai_assistant/skill_gap_report',
    element: <SkillGapReport />,
  },
  {
    path: 'idp/ai_assistant/chat_instructions',
    element: <ChatInstructions />,
  },
  {
    path: 'idp/ai_assistant/chat',
    element: <AIChat />,
  },
  {
    path: 'idp/steps/:step',
    element: <InitialSteps />,
  },
  {
    path: 'idp/my_plan',
    element: <MyPlan />,
  },
  {
    path: 'idp/reflective_questions',
    element: <ReflectiveQuestions />,
  },
  {
    path: 'idp/my_plan/:tab',
    element: <MyPlan />,
  },
  {
    path: 'idp/direct_reportees',
    element: <DirectReporteesList />,
  },
  {
    path: 'idp/direct_reportees/:userId',
    element: <DirectReportDetails />,
  },
  {
    path: 'idp/direct_reportees/:userId/:tab',
    element: <DirectReportDetails />,
  },
]

export default routes
