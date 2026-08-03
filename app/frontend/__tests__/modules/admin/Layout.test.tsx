import { ReactNode } from 'react'
import { act, render, screen } from '@testing-library/react'

const stub = (testId: string) => () => <div data-testid={testId} />

let ownedPathPrefixes: string[] | undefined

vi.mock('~/components/AdminShell', () => ({
  AdminShell: ({ children, ownedPathPrefixes: prefixes }: { children: ReactNode, ownedPathPrefixes?: string[] }) => {
    ownedPathPrefixes = prefixes

    return <div data-testid="admin-shell">{children}</div>
  },
}))

vi.mock('~/modules/admin/routes', () => ({ default: [{ path: 'clients', element: <div data-testid="clients" /> }] }))

vi.mock('~/components/IncorrectResponseErrorModal', () => ({ default: () => null }))
vi.mock('~/components/ErrorModal', () => ({ default: () => null }))
vi.mock('~/components/SessionTimeoutModal', () => ({ SessionTimeoutModal: () => null }))
vi.mock('~/components/DisplayExceptionModal', () => ({ DisplayExceptionModal: () => null }))

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
  WorkshopList: stub('workshop-list'),
}))

// The router is built from window.location at import time, so each case re-imports at the URL under test.
const renderAt = async (pathname: string) => {
  window.history.pushState({}, '', pathname)
  vi.resetModules()
  const { Layout, router } = await import('~/modules/admin/Layout')

  await act(async () => { render(<Layout />) })
  // Legacy-mode render: the lazy chunk only commits on a second flush, after its Suspense fallback painted.
  await act(async () => {})

  return router
}

describe('admin Layout router', () => {
  it.each([
    ['/admin/clients', 'clients'],
    ['/assessors', 'campaign-list'],
    ['/assessors/assessment_centers/campaigns', 'workshop-list'],
    ['/assessors/campaigns/7/users', 'user-list'],
    ['/assessors/campaigns/7/evaluations/9', 'evaluation'],
  ])('serves %s from the single admin router', async (pathname, testId) => {
    await renderAt(pathname)

    expect(screen.getByTestId('admin-shell')).toBeInTheDocument()
    expect(screen.getByTestId(testId)).toBeInTheDocument()
  })

  it('redirects the admin root to clients', async () => {
    const router = await renderAt('/admin')

    expect(router.state.location.pathname).toEqual('/admin/clients')
  })

  it('claims both prefixes so crossing the boundary stays client-side', async () => {
    await renderAt('/admin/clients')

    expect(ownedPathPrefixes).toEqual(['/admin', '/assessors'])
  })
})
