import { act, render, screen, waitFor } from '@testing-library/react'
import {
  Outlet, RouterProvider, createMemoryRouter,
} from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { routes as campaignRoutes } from '~/modules/admin/modules/campaigns/routes/Campaign/routes'
import ThreeSixtyCampaign from '~/modules/admin/modules/threeSixtyCampaign'

const CAMPAIGN_PATH = '/admin/projects/:projectId/new_campaigns/:campaignId/*'
const CAMPAIGN_URL = '/admin/projects/3/new_campaigns/9'

// Hoisted so the factories below can build stubs before the lazy page modules resolve.
const { chrome, stub } = vi.hoisted(() => ({
  stub: (testId: string) => () => <div data-testid={testId} />,
  chrome: (testId: string) => () => (
    <div data-testid={testId}>
      <Outlet />
    </div>
  ),
}))

vi.mock('~/modules/admin/modules/threeSixtyCampaign/pages', () => ({
  Participants: chrome('participants-chrome'),
  Messages: chrome('messages-chrome'),
  Reports: chrome('reports-chrome'),
  Admins: stub('admins'),
  Datasheet: stub('datasheet'),
  AIArtifacts: stub('ai-artifacts'),
  ParticipantsOptions: stub('participant-options'),
  SubjectList: stub('subjects'),
  EvaluatorList: stub('evaluators'),
  ManagerList: stub('managers'),
  MessagesOptions: stub('message-options'),
  EmailList: stub('emails'),
  InstructionList: stub('instructions'),
  MailHistories: stub('mail-histories'),
  ReportsOptions: stub('report-options'),
  ReportApprovalSetting: stub('report-approval'),
}))

vi.mock('~/modules/admin/modules/campaigns/pages', () => ({
  Admins: stub('common-admins'),
  Datasheet: stub('common-datasheet'),
}))

vi.mock('~/modules/admin/modules/campaigns/routes/Campaign/routes/Participants/pages', () => ({
  Participants: chrome('common-participants-chrome'),
  Subjects: stub('common-subjects'),
}))

const renderAt = async (pathname: string, { permissions = {}, campaignId = '9' } = {}) => {
  const store = configureStore({
    reducer: () => ({ threeSixtyCampaign: { campaignDetails: { permissions, campaignId } } }),
  })
  // Mounted the way the admin router mounts it: the campaign shell over the shared child table.
  // Rendering the real table here means a path whose page never resolves fails as a blank route.
  const router = createMemoryRouter(
    [{ path: CAMPAIGN_PATH, element: <ThreeSixtyCampaign />, children: campaignRoutes }],
    { initialEntries: [pathname] },
  )

  await act(async () => {
    render(<Provider store={store}><RouterProvider router={router} /></Provider>)
  })
  // This RTL version renders in React's legacy mode, where a resolved page chunk only commits inside an act flush.
  await act(async () => {})

  return router
}

describe('threesixty campaign index redirects', () => {
  it.each([
    [CAMPAIGN_URL, `${CAMPAIGN_URL}/participants/subjects`],
    [`${CAMPAIGN_URL}/participants`, `${CAMPAIGN_URL}/participants/subjects`],
    [`${CAMPAIGN_URL}/reports`, `${CAMPAIGN_URL}/reports/options`],
  ])('resolves %s to %s', async (pathname, resolved) => {
    const router = await renderAt(pathname)

    await waitFor(() => expect(router.state.location.pathname).toEqual(resolved))
  })

  it('resolves the messages root to the first tab the admin may see', async () => {
    const router = await renderAt(`${CAMPAIGN_URL}/messages`, { permissions: { accessInstructionMessages: true } })

    await waitFor(() => expect(router.state.location.pathname).toEqual(`${CAMPAIGN_URL}/messages/instructions`))
  })

  it('leaves the messages root alone for an admin who may see no tab', async () => {
    const router = await renderAt(`${CAMPAIGN_URL}/messages`)

    expect(router.state.location.pathname).toEqual(`${CAMPAIGN_URL}/messages`)
  })
})

describe('threesixty campaign deep links', () => {
  it('resolves a cold messages tab url through its chrome', async () => {
    await renderAt(`${CAMPAIGN_URL}/messages/instructions`)

    expect(await screen.findByTestId('instructions')).toBeInTheDocument()
    expect(screen.getByTestId('messages-chrome')).toBeInTheDocument()
  })

  it('renders the tab the campaign root redirects to', async () => {
    await renderAt(CAMPAIGN_URL)

    expect(await screen.findByTestId('subjects')).toBeInTheDocument()
    expect(screen.getByTestId('participants-chrome')).toBeInTheDocument()
  })

  it.each([
    ['admins', 'admins'],
    ['datasheet', 'datasheet'],
    ['reports/options', 'report-options'],
    ['participants/evaluators', 'evaluators'],
  ])('renders the %s tab', async (tab, testId) => {
    await renderAt(`${CAMPAIGN_URL}/${tab}`)

    expect(await screen.findByTestId(testId)).toBeInTheDocument()
  })
})

describe('campaign type picks the page on a shared url', () => {
  it.each([
    ['admins', 'common-admins'],
    ['datasheet', 'common-datasheet'],
    ['participants/subjects', 'common-subjects'],
  ])('renders the common campaign %s tab when the fetched campaign is not threesixty', async (tab, testId) => {
    await renderAt(`${CAMPAIGN_URL}/${tab}`, { campaignId: '404' })

    expect(await screen.findByTestId(testId)).toBeInTheDocument()
  })

  it('renders the common participants chrome for a common campaign', async () => {
    await renderAt(`${CAMPAIGN_URL}/participants/subjects`, { campaignId: '404' })

    expect(await screen.findByTestId('common-participants-chrome')).toBeInTheDocument()
  })
})
