import { Suspense } from 'react'
import { act, render, screen } from '@testing-library/react'
import {
  Outlet, RouterProvider, createMemoryRouter,
} from 'react-router-dom'
import routes from '~/modules/admin/routes'
import assessorRoutes from '~/modules/admin/modules/AssessorApp/routes'

const stub = (testId: string) => () => <div data-testid={testId} />

const chrome = (testId: string) => () => (
  <div data-testid={testId}>
    <Outlet />
  </div>
)

vi.mock('~/modules/admin/modules/Profile/pages', () => ({
  Details: stub('details'),
  ChangePassword: stub('change-password'),
}))
vi.mock('~/modules/admin/modules/Settings/routes/Maintenance', () => ({ default: stub('maintenance') }))
vi.mock('~/modules/admin/modules/Users/routes/UserList', () => ({
  default: ({ userTab }: { userTab: string }) => <div data-testid="users">{userTab}</div>,
}))
vi.mock('~/modules/admin/modules/Reports/pages', () => ({
  ReportList: ({ reportTab }: { reportTab: string }) => <div data-testid="reports">{reportTab}</div>,
  EditReport: stub('edit-report'),
  ReportBundleList: stub('report-bundles'),
  ReportBundleReportList: stub('report-bundle-reports'),
}))
vi.mock('~/modules/admin/modules/Assessments/pages', () => ({
  AssessmentList: ({ assessmentTab }: { assessmentTab: string }) => <div data-testid="assessments">{assessmentTab}</div>,
  EditAssessment: stub('edit-assessment'),
}))
vi.mock('~/modules/admin/modules/ReportApprovals/pages', () => ({
  MyTasks: stub('report-approval-tasks'),
  Approved: stub('report-approvals-approved'),
  All: stub('report-approvals-all'),
}))
vi.mock('~/modules/admin/modules/ScoreApprovals/pages', () => ({
  MyTasks: stub('score-approval-tasks'),
  Approved: stub('score-approvals-approved'),
  All: stub('score-approvals-all'),
  ScoreReview: stub('score-review'),
}))
vi.mock('~/modules/admin/modules/SkillsTaxonomy/pages', () => ({
  SkillList: stub('skills'),
  JobRoles: stub('job-roles'),
  Proficiency: stub('proficiency'),
  Settings: stub('taxonomy-tools'),
}))
vi.mock('~/modules/admin/modules/Dimensions/pages', () => ({
  DimensionsList: stub('dimensions'),
  Dimension: chrome('dimension-chrome'),
  SubFactorsList: stub('sub-factors'),
  OccupationConditionSetsList: stub('condition-sets'),
  FactorsList: stub('factors'),
  OccupationsList: stub('occupations'),
  InnovationStylesList: stub('innovation-styles'),
}))
vi.mock('~/modules/admin/modules/AssessorApp/pages', () => ({
  CampaignList: stub('assessor-campaigns'),
  UserList: stub('assessor-users'),
  UserDetails: stub('assessor-user'),
  Evaluation: stub('assessor-evaluation'),
  ReportPreview: stub('assessor-report'),
  ExternalReportPreview: stub('assessor-external-report'),
  WorkshopList: stub('assessor-workshops'),
  ModerateScoring: stub('assessor-moderate-scoring'),
}))

const renderAt = async (prefix: string, table: typeof routes, pathname: string) => {
  const router = createMemoryRouter(
    [{ path: prefix, element: <Suspense fallback="loading..."><Outlet /></Suspense>, children: table }],
    { initialEntries: [pathname] },
  )

  await act(async () => { render(<RouterProvider router={router} />) })
  // This RTL version renders in React's legacy mode, where a resolved route chunk only commits inside an act flush.
  await act(async () => {})

  return router
}

const renderAdmin = (pathname: string) => renderAt('/admin', routes, pathname)

describe('admin index redirects', () => {
  it.each([
    ['/admin/profile', '/admin/profile/details'],
    ['/admin/settings', '/admin/settings/maintenance'],
    ['/admin/users', '/admin/users/users'],
    ['/admin/reports', '/admin/reports/active'],
    ['/admin/assessments', '/admin/assessments/active'],
    ['/admin/report_approvals', '/admin/report_approvals/my_tasks'],
    ['/admin/ai_scoring_approvals', '/admin/ai_scoring_approvals/my_tasks'],
    ['/admin/skills_taxonomy', '/admin/skills_taxonomy/skills'],
    ['/admin/dimensions/4', '/admin/dimensions/4/factors'],
  ])('resolves %s to %s', async (pathname, resolved) => {
    const router = await renderAdmin(pathname)

    expect(router.state.location.pathname).toEqual(resolved)
  })

  it('resolves the assessor workshop root to its campaigns tab', async () => {
    const router = await renderAt('/assessors/*', assessorRoutes, '/assessors/assessment_centers')

    expect(router.state.location.pathname).toEqual('/assessors/assessment_centers/campaigns')
  })
})

describe('admin deep links', () => {
  it('resolves a cold dimension tab url through its chrome', async () => {
    await renderAdmin('/admin/dimensions/4/factors')

    expect(await screen.findByTestId('factors')).toBeInTheDocument()
    expect(screen.getByTestId('dimension-chrome')).toBeInTheDocument()
  })

  it('resolves a cold assessor url', async () => {
    await renderAt('/assessors/*', assessorRoutes, '/assessors/campaigns/5/users')

    expect(await screen.findByTestId('assessor-users')).toBeInTheDocument()
  })
})
