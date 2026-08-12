import { Suspense } from 'react'
import {
  act, render, screen, waitFor,
} from '@testing-library/react'
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
vi.mock('~/modules/admin/modules/Users/routes/UserList/UserList', () => ({
  UsersLayout: chrome('users-chrome'),
  RegularUsers: stub('users'),
  AdminUsers: stub('admins'),
  SuperAdminUsers: stub('superadmins'),
  GlobalAssessorUsers: stub('global-assessors'),
  default: stub('users'),
}))
vi.mock('~/modules/admin/modules/Reports/routes/ReportList/routes/ReportList/ReportList', () => ({
  ReportsLayout: chrome('reports-chrome'),
  ActiveReports: stub('reports'),
  ArchivedReports: stub('reports-archived'),
  DeletedReports: stub('reports-trash'),
  default: stub('reports'),
}))
vi.mock('~/modules/admin/modules/Reports/routes/ReportList/routes/EditReport', () => ({
  default: stub('edit-report'),
}))
vi.mock('~/modules/admin/modules/Reports/routes/ReportBundleList', () => ({ default: stub('report-bundles') }))
vi.mock('~/modules/admin/modules/Reports/routes/ReportBundleReportList', () => ({
  default: stub('report-bundle-reports'),
}))
vi.mock('~/modules/admin/modules/Assessments/routes/AssessmentList/AssessmentList', () => ({
  AssessmentsLayout: chrome('assessments-chrome'),
  ActiveAssessments: stub('assessments'),
  ArchivedAssessments: stub('assessments-archived'),
  DeletedAssessments: stub('assessments-trash'),
  AssessmentList: stub('assessments'),
}))
vi.mock('~/modules/admin/modules/Assessments/routes/EditAssessment', () => ({
  default: stub('edit-assessment'),
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
// Mocked leaf-by-leaf, not as `pages`: vitest hangs when a mocked module is imported twice concurrently, which is
// exactly what a nested lazy route does — see the "Promise.all(import(), import())" note in vitest's own mocker.
vi.mock('~/modules/admin/modules/Dimensions/routes/DimensionsList', () => ({ default: stub('dimensions') }))
vi.mock('~/modules/admin/modules/Dimensions/routes/Dimension', () => ({ default: chrome('dimension-chrome') }))
vi.mock('~/modules/admin/modules/Dimensions/routes/SubFactorsList', () => ({ default: stub('sub-factors') }))
vi.mock('~/modules/admin/modules/Dimensions/routes/OccupationConditionSetsList', () => ({
  default: stub('condition-sets'),
}))
vi.mock('~/modules/admin/modules/Dimensions/routes/Dimension/FactorsList', () => ({ default: stub('factors') }))
vi.mock('~/modules/admin/modules/Dimensions/routes/Dimension/OccupationsList', () => ({ default: stub('occupations') }))
vi.mock('~/modules/admin/modules/Dimensions/routes/Dimension/InnovationStylesList', () => ({
  default: stub('innovation-styles'),
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

  // Route chunks resolve over several turns, so callers wait for the settled state rather than a fixed flush count.
  await act(async () => { render(<RouterProvider router={router} />) })

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

    await waitFor(() => { expect(router.state.location.pathname).toEqual(resolved) })
  })

  it('resolves the assessor workshop root to its campaigns tab', async () => {
    const router = await renderAt('/assessors/*', assessorRoutes, '/assessors/assessment_centers')
    const campaignsTab = '/assessors/assessment_centers/campaigns'

    await waitFor(() => { expect(router.state.location.pathname).toEqual(campaignsTab) })
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
