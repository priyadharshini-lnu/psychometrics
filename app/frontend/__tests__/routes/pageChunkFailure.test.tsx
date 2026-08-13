import { Suspense, type ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import {
  Outlet, RouterProvider, createMemoryRouter, useMatches, useNavigation,
} from 'react-router-dom'
import RouteErrorBoundary, { RouteErrorCard } from '~/components/RouteErrorBoundary'
import { PageFallback } from '~/components/PageFallback'

const captureException = vi.hoisted(() => vi.fn())

vi.mock('@sentry/react', async importOriginal => ({
  ...await importOriginal<typeof import('@sentry/react')>(),
  captureException,
}))

const { I18n } = window
const CHUNK_ERROR = 'Failed to fetch dynamically imported module'

type Pages = { Page: ComponentType }

const deferred = <T, >() => {
  let reject: (reason: Error) => void = () => {}
  const promise = new Promise<T>((_resolve, fail) => { reject = fail })

  promise.catch(() => {})

  return { promise, reject }
}

// The admin shell's shape: the page area is a pathless layout route, so a dead chunk leaves the chrome standing.
const setup = () => {
  const users = deferred<Pages>()
  const clientPage = () => Promise.resolve<Pages>({ Page: () => <div>client page</div> })
  const usersComponent = async () => (await users.promise).Page

  const RoutedPage = () => {
    const matches = useMatches()

    return (
      <RouteErrorBoundary resetKey={matches[matches.length - 1]?.id}>
        <Suspense fallback={<PageFallback />}>
          {useNavigation().state === 'idle' ? <Outlet /> : <PageFallback />}
        </Suspense>
      </RouteErrorBoundary>
    )
  }

  const Shell = () => <div><nav>chrome</nav><Outlet /></div>

  const router = createMemoryRouter([{
    path: '/',
    element: <Shell />,
    children: [{
      element: <RoutedPage />,
      errorElement: <RouteErrorCard />,
      hydrateFallbackElement: <PageFallback />,
      children: [
        { path: 'clients', lazy: async () => ({ Component: (await clientPage()).Page }) },
        { path: 'users', lazy: async () => ({ Component: await usersComponent() }) },
      ],
    }],
  }], { initialEntries: ['/clients'] })

  const container = document.body.appendChild(document.createElement('div'))
  const root = createRoot(container)

  const flush = () => act(async () => { await new Promise((resume) => { setTimeout(resume, 0) }) })

  const mount = async () => { act(() => { root.render(<RouterProvider router={router} />) }); await flush() }
  const navigate = async (to: string) => { act(() => { void router.navigate(to) }); await flush() }
  const fail = async () => { users.reject(new Error(CHUNK_ERROR)); await flush() }
  const unmount = () => { act(() => { root.unmount() }); container.remove() }

  return {
    container, mount, navigate, fail, unmount,
  }
}

// React rethrows a caught render error on window in development; the boundary has already handled it.
const swallow = (event: ErrorEvent) => event.preventDefault()

describe('a page chunk that cannot be downloaded', () => {
  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    captureException.mockClear()
    window.addEventListener('error', swallow)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    window.removeEventListener('error', swallow)
    vi.restoreAllMocks()
  })

  it('shows the reload card with the shell still rendered', async () => {
    const {
      container, mount, navigate, fail, unmount,
    } = setup()

    await mount()
    await navigate('/users')
    await fail()

    expect(container.textContent).toContain('chrome')
    expect(container.textContent).toContain(I18n.t('admin.page_load_failed'))
    expect(container.textContent).toContain(I18n.t('frontend.request_failed_message_box.refresh'))
    expect(container.textContent).not.toContain('Unexpected Application Error')

    unmount()
  })

  it('leaves the rest of the app reachable', async () => {
    const {
      container, mount, navigate, fail, unmount,
    } = setup()

    await mount()
    await navigate('/users')
    await fail()
    await navigate('/clients')

    expect(container.textContent).toContain('client page')
    expect(container.textContent).not.toContain(I18n.t('admin.page_load_failed'))

    unmount()
  })

  // The card is all the user gets, so it must explain the reload without leaking any of the rejection text.
  it('explains the reload in plain words and never shows the raw error', async () => {
    const {
      container, mount, navigate, fail, unmount,
    } = setup()

    await mount()
    await navigate('/users')
    await fail()

    expect(container.textContent).toContain(I18n.t('admin.page_load_failed_hint'))
    expect(container.textContent).not.toContain(CHUNK_ERROR)

    unmount()
  })

  // A reported failure is the only signal there is now that nothing recovers on its own.
  it('reports the failure', async () => {
    const {
      mount, navigate, fail, unmount,
    } = setup()

    await mount()
    await navigate('/users')
    await fail()

    expect(captureException).toHaveBeenCalled()

    unmount()
  })
})
