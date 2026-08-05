import { Suspense } from 'react'
import { act, render, screen } from '@testing-library/react'
import {
  Outlet, RouterProvider, createMemoryRouter,
} from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import routes from '~/modules/admin/modules/threeSixtyCampaign/routes'

const CAMPAIGN_URL = '/admin/projects/3/new_campaigns/9'

const stub = (testId: string) => () => <div data-testid={testId} />

const chrome = (testId: string) => () => (
  <div data-testid={testId}>
    <Outlet />
  </div>
)

vi.mock('~/modules/admin/modules/threeSixtyCampaign/pages', () => ({
  ThreeSixtyCampaign: chrome('threesixty-chrome'),
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

const renderAt = async (pathname: string, permissions = {}) => {
  const store = configureStore({
    reducer: () => ({ threeSixtyCampaign: { campaignDetails: { permissions } } }),
  })
  const router = createMemoryRouter(
    [{ path: CAMPAIGN_URL, element: <Suspense fallback="loading..."><Outlet /></Suspense>, children: routes }],
    { initialEntries: [pathname] },
  )

  await act(async () => {
    render(<Provider store={store}><RouterProvider router={router} /></Provider>)
  })
  // This RTL version renders in React's legacy mode, where a resolved route chunk only commits inside an act flush.
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

    expect(router.state.location.pathname).toEqual(resolved)
  })

  it('resolves the messages root to the first tab the admin may see', async () => {
    const router = await renderAt(`${CAMPAIGN_URL}/messages`, { accessInstructionMessages: true })

    expect(router.state.location.pathname).toEqual(`${CAMPAIGN_URL}/messages/instructions`)
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
})
