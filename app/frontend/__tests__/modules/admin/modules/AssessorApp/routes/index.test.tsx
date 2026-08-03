import { Suspense } from 'react'
import { act, render, screen } from '@testing-library/react'
import {
  Outlet, RouterProvider, createMemoryRouter, useParams,
} from 'react-router-dom'
import routes from '~/modules/admin/modules/AssessorApp/routes'

const stub = (testId: string) => () => <div data-testid={testId} />

vi.mock('~/modules/admin/modules/AssessorApp/routes/CampaignList', () => ({ default: stub('campaign-list') }))
vi.mock('~/modules/admin/modules/AssessorApp/routes/UserList', () => ({ default: stub('user-list') }))
vi.mock('~/modules/admin/modules/AssessorApp/routes/UserDetails', () => ({ default: stub('user-details') }))
vi.mock('~/modules/admin/modules/AssessorApp/routes/Evaluation', () => ({ default: stub('evaluation') }))
vi.mock('~/modules/admin/modules/AssessorApp/routes/ReportPreview', () => ({ default: stub('report-preview') }))
vi.mock('~/modules/admin/modules/AssessorApp/routes/ExternalReportPreview', () => ({
  ExternalReportPreview: stub('external-report-preview'),
}))
vi.mock('~/modules/admin/modules/AssessorApp/routes/ModerateScoring', () => ({
  ModerateScoring: stub('moderate-scoring'),
}))
vi.mock('~/modules/admin/modules/AssessorApp/routes/AssessmentCenter', () => ({
  WorkshopList: () => {
    const { tab } = useParams()

    return <div data-testid="workshop-list">{tab}</div>
  },
}))

// This RTL version renders in React's legacy mode, where a lazy chunk only commits inside an explicit act flush.
const renderAt = async (pathname: string) => {
  const router = createMemoryRouter(
    [{
      path: '/assessors/*',
      element: <Suspense fallback="loading..."><Outlet /></Suspense>,
      children: routes,
    }],
    { initialEntries: [pathname] },
  )

  await act(async () => { render(<RouterProvider router={router} />) })

  return router
}

describe('AssessorApp routes', () => {
  it.each([
    ['/assessors', 'campaign-list'],
    ['/assessors/', 'campaign-list'],
    ['/assessors/assessment_centers/participants', 'workshop-list'],
    ['/assessors/campaigns/7/users', 'user-list'],
    ['/assessors/campaigns/7/users/9', 'user-details'],
    ['/assessors/campaigns/7/user_reports/3', 'report-preview'],
    ['/assessors/campaigns/7/external_user_report/3', 'external-report-preview'],
    ['/assessors/campaigns/7/evaluations/9', 'evaluation'],
    ['/assessors/campaigns/7/moderate_scoring/9', 'moderate-scoring'],
  ])('renders %s', async (pathname, testId) => {
    await renderAt(pathname)

    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  it('redirects the workshop root to the campaigns tab', async () => {
    const router = await renderAt('/assessors/assessment_centers')

    expect(router.state.location.pathname).toEqual('/assessors/assessment_centers/campaigns')
    expect(screen.getByTestId('workshop-list')).toHaveTextContent('campaigns')
  })
})
