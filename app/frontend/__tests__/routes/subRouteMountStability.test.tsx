import { useEffect } from 'react'
import { act, render } from '@testing-library/react'
import {
  Navigate, Outlet, RouterProvider, createMemoryRouter, useMatches, useNavigation,
} from 'react-router-dom'
import RouteErrorBoundary from '~/components/RouteErrorBoundary'

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

// A project layout shared by two tabs whose pages are split into different chunks.
const setupChunked = () => {
  let layoutMounts = 0

  const clientPages = () => Promise.resolve({
    Project: () => {
      useEffect(() => { layoutMounts += 1 }, [])

      return <div><nav>subnav</nav><Outlet /></div>
    },
    ProjectUsers: () => <div>project users</div>,
  })

  const campaignPages = () => Promise.resolve({ CampaignList: () => <div>campaign list</div> })

  const ProjectPage = () => {
    const matches = useMatches()

    return (
      <RouteErrorBoundary resetKey={matches[matches.length - 1]?.id}>
        {useNavigation().state === 'idle' ? <Outlet /> : <div>loading</div>}
      </RouteErrorBoundary>
    )
  }

  const router = createMemoryRouter([{
    path: '/',
    element: <ProjectPage />,
    children: [{
      path: 'projects/:projectId',
      lazy: async () => ({ Component: (await clientPages()).Project }),
      children: [
        { path: 'new_campaigns', lazy: async () => ({ Component: (await campaignPages()).CampaignList }) },
        { path: 'users', lazy: async () => ({ Component: (await clientPages()).ProjectUsers }) },
      ],
    }],
  }], { initialEntries: ['/projects/1/new_campaigns'] })

  const { container } = render(<RouterProvider router={router} />)
  const settle = () => act(async () => { await new Promise((resume) => { setTimeout(resume, 0) }) })
  const go = async (to: string) => { await act(async () => { await router.navigate(to) }) }

  return {
    container, go, settle, mounts: () => layoutMounts,
  }
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

describe('switching between sibling tabs whose pages come from different chunks', () => {
  it('keeps the shared parent layout mounted', async () => {
    const { container, go, mounts, settle } = setupChunked()

    await settle()

    expect(container.textContent).toContain('campaign list')
    expect(mounts()).toBe(1)

    await go('/projects/1/users')

    expect(container.textContent).toContain('project users')
    expect(mounts()).toBe(1)

    await go('/projects/1/new_campaigns')

    expect(container.textContent).toContain('campaign list')
    expect(mounts()).toBe(1)
  })
})
