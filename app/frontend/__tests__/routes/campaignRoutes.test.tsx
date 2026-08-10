import { Suspense } from 'react'
import { act, render, screen } from '@testing-library/react'
import {
  Outlet, RouterProvider, createMemoryRouter,
} from 'react-router-dom'
import routes from '~/modules/admin/modules/client/routes'

const CAMPAIGN_URL = '/admin/projects/3/new_campaigns/9'

const stub = (testId: string) => () => <div data-testid={testId} />

const chrome = (testId: string) => () => (
  <div data-testid={testId}>
    <Outlet />
  </div>
)

vi.mock('~/modules/admin/modules/client/pages', () => ({ Campaign: chrome('campaign-chrome') }))
vi.mock('~/modules/admin/modules/campaigns/pages', () => ({
  Participants: chrome('participants-chrome'),
  Scheduling: chrome('scheduling-chrome'),
  Scoring: chrome('scoring-chrome'),
  AIArtifacts: chrome('ai-artifacts-chrome'),
  AssessmentsReports: chrome('assessments-reports-chrome'),
  Dashboard: chrome('dashboard-chrome'),
  AssessorDetails: stub('assessor-details'),
  InitialStepsComponent: stub('idp-steps'),
  Plan: stub('idp-plan'),
  AssessmentCenterForm: stub('assessment-center-form'),
  WorkshopPage: stub('workshop-page'),
  InvitesForm: stub('invites-form'),
  IndividualInvite: stub('individual-invite'),
  Stats: stub('stats'),
  RegistrationCodes: stub('registration-codes'),
  Datasheet: stub('datasheet'),
  Admins: stub('admins'),
  CampaignOptions: stub('campaign-options'),
  DataExports: stub('audit-reports'),
  IdpReportPreview: stub('idp-report-preview'),
  Subjects: stub('subjects'),
  UserDetails: stub('user-details'),
  Assessors: stub('assessors'),
  SmsInvites: stub('sms-invites'),
  WorkshopList: stub('workshops'),
  Invites: stub('invites'),
  SubjectScoresList: stub('subject-scores'),
  ScoringGroups: stub('scoring-groups'),
  Weightages: stub('weightages'),
  Result: stub('ai-results'),
  AIArtifactsSettings: stub('ai-settings'),
  Manage: stub('manage'),
  Sequencing: stub('sequencing'),
  ReportApprovalSetting: stub('report-approval'),
  AIScoringApprovalSetting: stub('ai-scoring-approval'),
  Preview: stub('dashboard-preview'),
  Initialize: stub('dashboard-initialize'),
  DashboardSettings: stub('dashboard-settings'),
  Accesssheet: stub('accesssheets'),
  AccesssheetSettings: stub('accesssheet-settings'),
  CampaignList: stub('campaign-list'),
  ReportPreview: stub('report-preview'),
  ExternalReportPreview: stub('external-report-preview'),
}))

const renderAt = async (pathname: string) => {
  const router = createMemoryRouter(
    [{ path: '/admin', element: <Suspense fallback="loading..."><Outlet /></Suspense>, children: routes }],
    { initialEntries: [pathname] },
  )

  await act(async () => { render(<RouterProvider router={router} />) })
  // This RTL version renders in React's legacy mode, where a resolved route chunk only commits inside an act flush.
  await act(async () => {})

  return router
}

describe('campaign index redirects', () => {
  it.each([
    [CAMPAIGN_URL, `${CAMPAIGN_URL}/participants/subjects`],
    [`${CAMPAIGN_URL}/participants`, `${CAMPAIGN_URL}/participants/subjects`],
    [`${CAMPAIGN_URL}/participants/subjects/7`, `${CAMPAIGN_URL}/participants/subjects/7/assessments`],
    [`${CAMPAIGN_URL}/scheduling`, `${CAMPAIGN_URL}/scheduling/assessment_center`],
    [`${CAMPAIGN_URL}/scoring`, `${CAMPAIGN_URL}/scoring/subject_scores`],
    [`${CAMPAIGN_URL}/ai_artifacts`, `${CAMPAIGN_URL}/ai_artifacts/results`],
    [`${CAMPAIGN_URL}/assessments_reports`, `${CAMPAIGN_URL}/assessments_reports/manage`],
  ])('resolves %s to %s', async (pathname, resolved) => {
    const router = await renderAt(pathname)

    expect(router.state.location.pathname).toEqual(resolved)
  })
})

describe('campaign deep links', () => {
  it('resolves a cold subject tab url through both chromes', async () => {
    await renderAt(`${CAMPAIGN_URL}/participants/subjects/7/assessments`)

    expect(await screen.findByTestId('user-details')).toBeInTheDocument()
    expect(screen.getByTestId('participants-chrome')).toBeInTheDocument()
    expect(screen.getByTestId('campaign-chrome')).toBeInTheDocument()
  })
})
