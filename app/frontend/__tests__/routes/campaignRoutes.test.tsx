import { Suspense } from 'react'
import { act, render, screen } from '@testing-library/react'
import {
  Outlet, RouterProvider, createMemoryRouter,
} from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
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
  Stats: stub('stats'),
  RegistrationCodes: stub('registration-codes'),
  Datasheet: stub('datasheet'),
  Admins: stub('admins'),
  CampaignOptions: stub('campaign-options'),
  DataExports: stub('audit-reports'),
  CampaignList: stub('campaign-list'),
}))
vi.mock('~/modules/admin/modules/campaigns/routes/Campaign/routes/Participants/pages', () => ({
  Participants: chrome('participants-chrome'),
  Subjects: stub('subjects'),
  UserDetails: stub('user-details'),
  Assessors: stub('assessors'),
  AssessorDetails: stub('assessor-details'),
  SmsInvites: stub('sms-invites'),
}))
vi.mock('~/modules/admin/modules/campaigns/routes/Campaign/routes/Scheduling/pages', () => ({
  Scheduling: chrome('scheduling-chrome'),
  WorkshopList: stub('workshops'),
  AssessmentCenterForm: stub('assessment-center-form'),
  WorkshopPage: stub('workshop-page'),
  Invites: stub('invites'),
  InvitesForm: stub('invites-form'),
  IndividualInvite: stub('individual-invite'),
}))
vi.mock('~/modules/admin/modules/campaigns/routes/Campaign/routes/Scoring/pages', () => ({
  Scoring: chrome('scoring-chrome'),
  SubjectScoresList: stub('subject-scores'),
  ScoringGroups: stub('scoring-groups'),
  Weightages: stub('weightages'),
}))
vi.mock('~/modules/admin/modules/campaigns/routes/Campaign/routes/AIArtifacts/pages', () => ({
  AIArtifacts: chrome('ai-artifacts-chrome'),
  Result: stub('ai-results'),
  AIArtifactsSettings: stub('ai-settings'),
}))
vi.mock('~/modules/admin/modules/campaigns/routes/Campaign/routes/AssessmentsReports/pages', () => ({
  AssessmentsReports: chrome('assessments-reports-chrome'),
  Manage: stub('manage'),
  Sequencing: stub('sequencing'),
  ReportApprovalSetting: stub('report-approval'),
  AIScoringApprovalSetting: stub('ai-scoring-approval'),
}))
vi.mock('~/modules/admin/modules/campaigns/routes/Campaign/routes/Dashboard/pages', () => ({
  Dashboard: chrome('dashboard-chrome'),
  Preview: stub('dashboard-preview'),
  Initialize: stub('dashboard-initialize'),
  DashboardSettings: stub('dashboard-settings'),
  Accesssheet: stub('accesssheets'),
  AccesssheetSettings: stub('accesssheet-settings'),
}))
vi.mock('~/modules/admin/modules/campaigns/routes/Campaign/routes/IdpReportPreview/pages', () => ({
  IdpReportPreview: stub('idp-report-preview'),
}))
vi.mock('~/modules/admin/modules/campaigns/routes/IDP/pages', () => ({
  InitialStepsComponent: stub('idp-steps'),
  Plan: stub('idp-plan'),
}))
vi.mock('~/modules/admin/modules/campaigns/routes/ReportPreview/pages', () => ({
  ReportPreview: stub('report-preview'),
  ExternalReportPreview: stub('external-report-preview'),
}))

const renderAt = async (pathname: string) => {
  // No fetched threesixty campaign in state, so the urls both campaign types claim resolve to the common page.
  const store = configureStore({ reducer: () => ({ threeSixtyCampaign: { campaignDetails: {} } }) })
  const router = createMemoryRouter(
    [{ path: '/admin', element: <Suspense fallback="loading..."><Outlet /></Suspense>, children: routes }],
    { initialEntries: [pathname] },
  )

  await act(async () => { render(<Provider store={store}><RouterProvider router={router} /></Provider>) })
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
