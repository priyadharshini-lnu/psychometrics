import { ReactNode } from 'react'
import { screen } from '@testing-library/react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'

// Every case re-imports the whole admin route graph, which costs seconds on a cold module cache.
vi.setConfig({ testTimeout: 30000 })

const stub = (testId: string) => () => <div data-testid={testId} />

let ownedPathPrefixes: string[] | undefined

vi.mock('~/components/AdminShell', () => ({
  AdminTheme: ({ children }: { children: ReactNode }) => <div data-testid="admin-theme">{children}</div>,
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

// The assessor gate reads the permission-gated menu links, so each case declares who is looking.
const ASSESSOR_LINKS = { clients: '/admin/clients', assessorDashboard: '/assessors' }

const makeStore = (links: Record<string, string>) => configureStore({
  reducer: () => ({ ui: { menu: { links, collapsed: false } }, features: {} }),
})

let cleanup = () => {}

// The router is built from window.location at import time, so each case re-imports at the URL under test.
const renderAt = async (pathname: string, links: Record<string, string> = ASSESSOR_LINKS) => {
  window.history.pushState({}, '', pathname)
  vi.resetModules()
  const { Layout, router } = await import('~/modules/admin/Layout')

  const container = document.body.appendChild(document.createElement('div'))
  const root = createRoot(container)
  cleanup = () => { act(() => { root.unmount() }); container.remove() }

  await act(async () => { root.render(<Provider store={makeStore(links)}><Layout /></Provider>) })

  return router
}

// Each pass leaves act, which is the only point at which the page chunk's pending import can settle.
const findPage = async (testId: string, passes = 100): Promise<HTMLElement> => {
  if (passes > 0 && !screen.queryByTestId(testId)) {
    await act(async () => { await new Promise((resume) => { setTimeout(resume, 10) }) })

    return findPage(testId, passes - 1)
  }

  return screen.getByTestId(testId)
}

describe('admin Layout router', () => {
  beforeEach(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = true })
  afterEach(() => { cleanup() })

  it.each([
    ['/admin/clients', 'clients'],
    ['/assessors', 'campaign-list'],
    ['/assessors/assessment_centers/campaigns', 'workshop-list'],
    ['/assessors/campaigns/7/users', 'user-list'],
    ['/assessors/campaigns/7/evaluations/9', 'evaluation'],
  ])('serves %s from the single admin router', async (pathname, testId) => {
    await renderAt(pathname)

    expect(await findPage(testId)).toBeInTheDocument()
    expect(screen.getByTestId('admin-shell')).toBeInTheDocument()
  })

  it('redirects the admin root to clients', async () => {
    const router = await renderAt('/admin')

    expect(router.state.location.pathname).toEqual('/admin/clients')
  })

  it('claims both prefixes so crossing the boundary stays client-side', async () => {
    await renderAt('/admin/clients')

    expect(ownedPathPrefixes).toEqual(['/admin', '/assessors'])
  })

  it('sends a user without assessor permission from /assessors to the admin shell', async () => {
    const router = await renderAt('/assessors', { clients: '/admin/clients' })

    expect(router.state.location.pathname).toEqual('/admin/clients')
    expect(screen.getByTestId('clients')).toBeInTheDocument()
  })
})
