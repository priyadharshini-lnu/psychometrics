import { Suspense } from 'react'
import { act, render, screen } from '@testing-library/react'
import {
  Outlet, RouterProvider, createMemoryRouter, useParams,
} from 'react-router-dom'
import { fullPaths } from './fullPaths'

const stub = (testId: string) => () => <div data-testid={testId} />

vi.mock('~/modules/endUser/modules/campaigns/routes/CampaignList', () => ({ CampaignList: stub('campaign-list') }))
vi.mock('~/modules/endUser/modules/campaigns/routes/Campaign', () => ({ Campaign: stub('campaign') }))
vi.mock('~/modules/endUser/modules/campaigns/routes/Profile', () => ({ Profile: stub('profile') }))
vi.mock('~/modules/endUser/modules/campaigns/routes/ChangePassword', () => ({
  ChangePassword: stub('change-password'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/Insights', () => ({ Insights: stub('insights') }))
vi.mock('~/modules/endUser/modules/campaigns/routes/UserAssessment', () => ({
  UserAssessment: stub('user-assessment'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/Assessment', () => ({ Assessment: stub('assessment') }))
vi.mock('~/modules/endUser/modules/campaigns/routes/AgileUserAssessment', () => ({
  AgileUserAssessment: stub('agile-user-assessment'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/CheckingWizard', () => ({
  CheckingWizard: stub('checking-wizard'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/Nomination', () => ({ Nomination: stub('nomination') }))
vi.mock('~/modules/endUser/modules/campaigns/routes/Evaluation', () => ({ Evaluation: stub('evaluation') }))
vi.mock('~/modules/endUser/modules/campaigns/routes/Report', () => ({ Report: stub('report') }))
vi.mock('~/modules/endUser/modules/campaigns/routes/Anonym', () => ({ Anonym: stub('anonym') }))
vi.mock('~/modules/endUser/modules/campaigns/routes/MeetingRoom', () => ({ default: stub('meeting-room') }))

vi.mock('~/modules/endUser/modules/campaigns/routes/Bookings', () => ({
  Bookings: () => (
    <div data-testid="bookings-chrome">
      <Outlet />
    </div>
  ),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/Bookings/routes/BookingsAndInvitesList', () => ({
  BookingsAndInvitesList: stub('invites-list'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/Bookings/routes/BookingsAndInvitesDetails', () => ({
  BookingsAndInvitesDetails: () => <div data-testid="invite-details">{useParams().inviteOrBookingId}</div>,
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/Bookings/routes/BookingsSuccess', () => ({
  BookingsSuccess: stub('invite-success'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/Campaign/CampaignLevelSystemChecks/SystemChecksStepper', () => ({
  SystemChecksStepper: stub('system-check-step'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/Campaign/CampaignLevelSystemChecks/Welcome', () => ({
  Welcome: stub('system-check-welcome'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/idp/MyPlan', () => ({ MyPlan: stub('my-plan') }))
vi.mock('~/modules/endUser/modules/campaigns/routes/idp/InitialSteps', () => ({ InitialSteps: stub('idp-steps') }))
vi.mock('~/modules/endUser/modules/campaigns/routes/idp/ReflectiveQuestions', () => ({
  ReflectiveQuestions: stub('reflective-questions'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/idp/DirectReportees/List', () => ({
  DirectReporteesList: stub('direct-reportees'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/idp/DirectReportees/Details', () => ({
  DirectReportDetails: stub('direct-reportee'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/idp/AIAssistant/AIStartPage', () => ({
  AIStartPage: stub('ai-start'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/idp/AIAssistant/AIChat', () => ({ AIChat: stub('ai-chat') }))
vi.mock('~/modules/endUser/modules/campaigns/routes/idp/AIAssistant/SkillGapReport', () => ({
  SkillGapReport: stub('skill-gap-report'),
}))
vi.mock('~/modules/endUser/modules/campaigns/routes/idp/AIAssistant/ChatInstructions', () => ({
  ChatInstructions: stub('chat-instructions'),
}))

// Imported here rather than at the top so the page mocks are in place before the table is built.
const participantRoutes = async () => (await import('~/modules/endUser/modules/campaigns/routes')).default

const renderAt = async (pathname: string) => {
  const routes = await participantRoutes()
  const router = createMemoryRouter(
    [{ path: '/', element: <Suspense fallback="loading..."><Outlet /></Suspense>, children: routes }],
    { initialEntries: [pathname] },
  )

  await act(async () => { render(<RouterProvider router={router} />) })

  return router
}

describe('participant route table', () => {
  it('serves the participant urls', async () => {
    expect(fullPaths(await participantRoutes())).toEqual([
      '(index)',
      'dashboard',
      'campaigns/:campaignId',
      'campaign_system_check/:campaignId/welcome',
      'campaign_system_check/:campaignId/:step',
      'threesixty_campaigns/:campaignId',
      'invites',
      'invites/(index)',
      'invites/:inviteOrBookingId/details',
      'invites/:inviteOrBookingId/success',
      'profile_details',
      'change_password',
      'campaigns/:campaignId/insights',
      'user_assessments/:userAssessmentId',
      'user_assessments/:userAssessmentId/*',
      'agile_user_assessments/:userAssessmentId',
      'system_checks/:assessmentId/:id',
      'threesixty_campaigns/:campaignId/nominations/:id',
      'threesixty_campaigns/:campaignId/evaluations/:id',
      'threesixty_campaigns/:campaignId/reports/:id',
      'anonym/:assessmentKey',
      'meet/:roomId',
      'idp/ai_assistant/start',
      'idp/ai_assistant/skill_gap_report',
      'idp/ai_assistant/chat_instructions',
      'idp/ai_assistant/chat',
      'idp/steps/:step',
      'idp/my_plan',
      'idp/reflective_questions',
      'idp/my_plan/:tab',
      'idp/direct_reportees',
      'idp/direct_reportees/:userId',
      'idp/direct_reportees/:userId/:tab',
    ])
  })
})

describe('participant deep links', () => {
  it('resolves a cold invite url through the bookings chrome', async () => {
    await renderAt('/invites/7/details')

    expect(await screen.findByTestId('invite-details')).toHaveTextContent('7')
    expect(screen.getByTestId('bookings-chrome')).toBeInTheDocument()
  })
})
