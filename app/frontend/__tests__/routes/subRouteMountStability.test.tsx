import { Suspense, useEffect } from 'react'
import { act, render } from '@testing-library/react'
import {
  Navigate, Outlet, RouterProvider, createMemoryRouter, useMatches,
} from 'react-router-dom'
import RouteErrorBoundary from '~/components/RouteErrorBoundary'
import { lazyPages } from '~/utils/lazyPages'
import { usePageChunk } from '~/utils/usePageChunk'

const { I18n } = window

// React rethrows a caught render error on window in development; the boundary has already handled it.
const swallow = (event: ErrorEvent) => event.preventDefault()

const Boom = () => { throw new Error('kaboom') }

// The admin shell's shape: one boundary around the outlet, a section wrapper, then index-redirected leaves.
const setup = () => {
  let wrapperMounts = 0

  const RoutedPage = () => {
    const matches = useMatches()

    return (
      <RouteErrorBoundary resetKey={matches[matches.length - 1]?.id}>
        <Outlet />
      </RouteErrorBoundary>
    )
  }

  const CampaignWrapper = () => {
    useEffect(() => { wrapperMounts += 1 }, [])

    return <div><nav>subnav</nav><Outlet /></div>
  }

  const router = createMemoryRouter([{
    path: '/',
    element: <RoutedPage />,
    children: [{
      path: 'campaign',
      element: <CampaignWrapper />,
      children: [
        {
          path: 'participants',
          element: <Outlet />,
          children: [
            { index: true, element: <Navigate to="subjects" replace /> },
            { path: 'subjects', element: <div>subjects</div> },
          ],
        },
        {
          path: 'scheduling',
          element: <Outlet />,
          children: [
            { index: true, element: <Navigate to="assessment_center" replace /> },
            { path: 'assessment_center', element: <div>assessment center</div> },
          ],
        },
        { path: 'broken', element: <Boom /> },
      ],
    }],
  }], { initialEntries: ['/campaign/participants/subjects'] })

  const { container } = render(<RouterProvider router={router} />)
  const go = async (to: string) => { await act(async () => { await router.navigate(to) }) }

  return { container, go, mounts: () => wrapperMounts }
}

// The 360-campaign layout's shape: the same boundary, wrapped around a chunk-keyed suspense boundary.
const setupChunked = () => {
  let pageMounts = 0

  const Participants = lazyPages('threeSixtyCampaign', () => Promise.resolve({
    Participants: () => {
      useEffect(() => { pageMounts += 1 }, [])

      return <div><nav>subnav</nav><Outlet /></div>
    },
  }))(m => m.Participants)

  const CampaignPage = () => {
    const matches = useMatches()

    return (
      <RouteErrorBoundary resetKey={matches[matches.length - 1]?.id}>
        <Suspense key={usePageChunk(router.routes)} fallback={<div>loading</div>}>
          <Outlet />
        </Suspense>
      </RouteErrorBoundary>
    )
  }

  const router = createMemoryRouter([{
    path: '/campaign',
    element: <CampaignPage />,
    children: [{
      path: 'participants',
      element: <Participants />,
      children: [
        { index: true, element: <div>subjects</div> },
        { path: 'raters', element: <div>raters</div> },
      ],
    }],
  }], { initialEntries: ['/campaign/participants'] })

  const { container } = render(<RouterProvider router={router} />)
  const go = async (to: string) => { await act(async () => { await router.navigate(to) }) }

  return { container, go, mounts: () => pageMounts }
}

describe('navigating between campaign sub-routes', () => {
  beforeEach(() => {
    window.addEventListener('error', swallow)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    window.removeEventListener('error', swallow)
    vi.restoreAllMocks()
  })

  it('keeps the section wrapper mounted across sub-route switches', async () => {
    const { container, go, mounts } = setup()

    expect(mounts()).toBe(1)

    await go('/campaign/scheduling/assessment_center')
    await go('/campaign/participants/subjects')

    expect(container.textContent).toContain('subjects')
    expect(mounts()).toBe(1)
  })

  it('keeps it mounted even when a section root index-redirects', async () => {
    const { container, go, mounts } = setup()

    await go('/campaign/scheduling')

    expect(container.textContent).toContain('assessment center')
    expect(mounts()).toBe(1)
  })

  it('clears a caught error once the user navigates away', async () => {
    const { container, go } = setup()

    await go('/campaign/broken')

    expect(container.textContent).toContain(I18n.t('errors.error_msg'))

    await go('/campaign/participants/subjects')

    expect(container.textContent).toContain('subjects')
    expect(container.textContent).not.toContain(I18n.t('errors.error_msg'))
  })
})

describe('a layout whose boundary wraps a chunk-keyed suspense boundary', () => {
  it('keeps the section page mounted across its sub-routes', async () => {
    const { container, go, mounts } = setupChunked()

    await go('/campaign/participants/raters')

    expect(container.textContent).toContain('raters')
    expect(mounts()).toBe(1)

    await go('/campaign/participants')

    expect(container.textContent).toContain('subjects')
    expect(mounts()).toBe(1)
  })
})
