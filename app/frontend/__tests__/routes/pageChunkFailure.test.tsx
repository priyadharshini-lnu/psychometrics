import { Suspense } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import {
  Outlet, RouterProvider, createMemoryRouter, useMatches,
} from 'react-router-dom'
import RouteErrorBoundary from '~/components/RouteErrorBoundary'
import { PageFallback } from '~/components/PageFallback'
import { lazyPages } from '~/utils/lazyPages'
import { usePageChunk } from '~/utils/usePageChunk'

const { I18n } = window

type Pages = { Page: ComponentType }

const deferred = <T, >() => {
  let reject: (reason: Error) => void = () => {}
  const promise = new Promise<T>((_resolve, fail) => { reject = fail })

  promise.catch(() => {})

  return { promise, reject }
}

// The admin shell's shape: the chunk-keyed suspense boundary outside, the route error boundary around the page.
const setup = () => {
  const users = deferred<Pages>()
  const ClientPage = lazyPages('client', () => Promise.resolve<Pages>({
    Page: () => <div>client page</div>,
  }))(m => m.Page)
  const UsersPage = lazyPages('users', () => users.promise)(m => m.Page)

  const RoutedPage = () => {
    const matches = useMatches()

    return (
      <RouteErrorBoundary resetKey={matches[matches.length - 1]?.id}>
        <Outlet />
      </RouteErrorBoundary>
    )
  }

  const Shell = () => (
    <div>
      <nav>chrome</nav>
      <Suspense key={usePageChunk(router.routes)} fallback={<PageFallback />}>
        <RoutedPage />
      </Suspense>
    </div>
  )

  const router = createMemoryRouter([{
    path: '/',
    element: <Shell />,
    children: [
      { path: 'clients', element: <ClientPage /> },
      { path: 'users', element: <UsersPage /> },
    ],
  }], { initialEntries: ['/clients'] })

  const container = document.body.appendChild(document.createElement('div'))
  const root = createRoot(container)

  const mount = async () => { await act(async () => { root.render(<RouterProvider router={router} />) }) }
  const unmount = () => { act(() => { root.unmount() }); container.remove() }

  return {
    users, router, container, mount, unmount,
  }
}

// React rethrows a caught render error on window in development; the boundary has already handled it.
const swallow = (event: ErrorEvent) => event.preventDefault()

describe('a page chunk that cannot be downloaded', () => {
  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    window.addEventListener('error', swallow)
    vi.spyOn(console, 'error').mockImplementation(() => {})
  })

  afterEach(() => {
    window.removeEventListener('error', swallow)
    vi.restoreAllMocks()
  })

  it('shows the refreshable error card with the shell still rendered', async () => {
    const {
      users, router, container, mount, unmount,
    } = setup()

    await mount()
    await act(async () => { await router.navigate('/users') })
    await act(async () => { users.reject(new Error('Failed to fetch dynamically imported module')) })

    expect(container.textContent).toContain('chrome')
    expect(container.textContent).toContain(I18n.t('errors.error_msg'))
    expect(container.textContent).toContain(I18n.t('frontend.request_failed_message_box.refresh'))
    expect(container.textContent).not.toContain('Unexpected Application Error')

    unmount()
  })

  it('leaves the rest of the app reachable', async () => {
    const {
      users, router, container, mount, unmount,
    } = setup()

    await mount()
    await act(async () => { await router.navigate('/users') })
    await act(async () => { users.reject(new Error('Failed to fetch dynamically imported module')) })
    await act(async () => { await router.navigate('/clients') })

    expect(container.textContent).toContain('client page')
    expect(container.textContent).not.toContain(I18n.t('errors.error_msg'))

    unmount()
  })

  // React.lazy keeps its rejection, so the refresh button is the only way back onto that page.
  it('keeps failing on the same page until the tab reloads', async () => {
    const {
      users, router, container, mount, unmount,
    } = setup()

    await mount()
    await act(async () => { await router.navigate('/users') })
    await act(async () => { users.reject(new Error('Failed to fetch dynamically imported module')) })
    await act(async () => { await router.navigate('/clients') })
    await act(async () => { await router.navigate('/users') })

    expect(container.textContent).toContain(I18n.t('errors.error_msg'))

    unmount()
  })
})
