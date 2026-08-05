import { Suspense } from 'react'
import { act, render, screen } from '@testing-library/react'
import {
  Outlet, RouterProvider, createMemoryRouter,
} from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import routes from '~/modules/admin/modules/client/routes'

const stub = (testId: string) => () => <div data-testid={testId} />

const chrome = (testId: string) => () => (
  <div data-testid={testId}>
    <Outlet />
  </div>
)

vi.mock('~/modules/admin/modules/client/pages', () => ({
  ClientList: stub('clients'),
  Client: chrome('client-chrome'),
  Campaign: chrome('campaign-chrome'),
  LicenseUsageList: stub('license-usages'),
  Project: chrome('project-chrome'),
  ProjectList: stub('projects'),
  ClientAdmins: stub('client-admins'),
  ClientAssessors: stub('client-assessors'),
  ClientSettings: stub('client-settings'),
  ClientDataReports: stub('client-data-reports'),
  ClientDataExports: stub('client-audit-reports'),
  ClientLicenseList: stub('client-licenses'),
  ProjectAdmins: stub('project-admins'),
  ProjectUsers: chrome('users-chrome'),
  ProjectDatasheet: stub('project-datasheet'),
  ProjectSettings: chrome('settings-chrome'),
  ProjectDataExports: stub('project-audit-reports'),
  ProjectIdp: chrome('idp-chrome'),
  ProjectTaxonomy: chrome('taxonomy-chrome'),
  ProjectLicenseList: stub('project-licenses'),
  ProjectParticipants: stub('participants'),
  ProjectAssessors: stub('assessors'),
  IdpList: stub('idp-templates'),
  IdpDetails: stub('idp-template'),
  IdpSettings: stub('idp-settings'),
  ReflectionQuestions: stub('reflection-questions'),
  InterviewQuestions: stub('interview-questions'),
  Smtp: stub('smtp'),
  SamlTabbed: stub('saml'),
  Integrations: stub('integrations'),
  MettlScheduleRecords: stub('mettl-schedule-records'),
  SecuritySettings: stub('security'),
  General: stub('general'),
  Webhooks: stub('webhooks'),
  Design: stub('design'),
  Profile: stub('profile'),
  Registration: stub('registration'),
  Privacy: stub('privacy'),
  Assessments: stub('assessments'),
  Features: stub('features'),
  Applications: stub('applications'),
  ApplicationDetails: stub('application-details'),
}))
vi.mock('~/modules/admin/modules/campaigns/pages', () => ({ CampaignList: stub('campaign-list') }))
vi.mock('~/modules/admin/modules/SkillsTaxonomy/pages', () => ({
  SkillList: stub('skills'),
  JobRoles: stub('job-roles'),
  Proficiency: stub('proficiency'),
  Settings: stub('taxonomy-settings'),
}))
vi.mock('~/modules/admin/modules/DataReports/pages', () => ({
  DataReports: stub('data-reports'),
  DataReportJobs: stub('data-report-jobs'),
}))
vi.mock('~/modules/admin/modules/DevelopmentActions/components/DevelopmentActionList', () => ({
  default: stub('development-actions'),
}))

const renderAt = async (pathname: string, permissions = {}) => {
  const store = configureStore({ reducer: () => ({ currentUser: { permissions } }) })
  const router = createMemoryRouter(
    [{ path: '/admin', element: <Suspense fallback="loading..."><Outlet /></Suspense>, children: routes }],
    { initialEntries: [pathname] },
  )

  await act(async () => {
    render(<Provider store={store}><RouterProvider router={router} /></Provider>)
  })
  // This RTL version renders in React's legacy mode, where a resolved route chunk only commits inside an act flush.
  await act(async () => {})

  return router
}

describe('client and project index redirects', () => {
  it.each([
    ['/admin/clients/7', '/admin/clients/7/projects'],
    ['/admin/projects/3', '/admin/projects/3/new_campaigns'],
    ['/admin/projects/3/users', '/admin/projects/3/users/participants'],
    ['/admin/projects/3/taxonomy', '/admin/projects/3/taxonomy/skills'],
  ])('resolves %s to %s', async (pathname, resolved) => {
    const router = await renderAt(pathname)

    expect(router.state.location.pathname).toEqual(resolved)
  })

  it('resolves the settings root to the first tab the admin may manage', async () => {
    const router = await renderAt('/admin/projects/3/settings', { manageProjectSmtpSettings: true })

    expect(router.state.location.pathname).toEqual('/admin/projects/3/settings/smtp')
  })

  it('resolves the idp root to the first tab the admin may see', async () => {
    const router = await renderAt('/admin/projects/3/idp', { accessReflectionQuestions: true })

    expect(router.state.location.pathname).toEqual('/admin/projects/3/idp/reflection_questions')
  })
})

describe('idp permission gates', () => {
  it('serves an idp tab the admin holds the grant for', async () => {
    await renderAt('/admin/projects/3/idp/templates', { accessIdpTemplates: true })

    expect(await screen.findByTestId('idp-templates')).toBeInTheDocument()
  })

  it.each([
    ['templates', 'idp-templates'],
    ['settings', 'idp-settings'],
    ['development_actions', 'development-actions'],
    ['reflection_questions', 'reflection-questions'],
    ['interview_questions', 'interview-questions'],
  ])('keeps idp/%s off the screen for an admin without the grant', async (tab, testId) => {
    await renderAt(`/admin/projects/3/idp/${tab}`)

    expect(await screen.findByTestId('idp-chrome')).toBeInTheDocument()
    expect(screen.queryByTestId(testId)).not.toBeInTheDocument()
  })
})

describe('client deep links', () => {
  it('resolves a cold project settings tab url through both chromes', async () => {
    await renderAt('/admin/projects/3/settings/general')

    expect(await screen.findByTestId('general')).toBeInTheDocument()
    expect(screen.getByTestId('settings-chrome')).toBeInTheDocument()
    expect(screen.getByTestId('project-chrome')).toBeInTheDocument()
  })
})
