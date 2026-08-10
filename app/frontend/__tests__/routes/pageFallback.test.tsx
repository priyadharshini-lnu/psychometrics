import { Suspense } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { Outlet, RouterProvider, createMemoryRouter } from 'react-router-dom'
import { FALLBACK_DELAY, PageFallback } from '~/components/PageFallback'
import { lazyPages } from '~/utils/lazyPages'
import { usePageChunk } from '~/utils/usePageChunk'

type Pages = { Page: ComponentType }

const PAST_THE_DELAY = FALLBACK_DELAY + 60

const deferred = <T, >() => {
  let resolve: (value: T) => void = () => {}
  const promise = new Promise<T>((settle) => { resolve = settle })

  return { promise, resolve }
}

const mountInto = (node: JSX.Element) => {
  const container = document.body.appendChild(document.createElement('div'))
  const root = createRoot(container)
  const skeleton = () => container.querySelector('[role="status"]')

  return {
    container,
    skeleton,
    render: async () => { await act(async () => { root.render(node) }) },
    unmount: () => { act(() => { root.unmount() }); container.remove() },
  }
}

const wait = (ms: number) => act(async () => { await new Promise((resume) => { setTimeout(resume, ms) }) })

const setup = () => {
  const clients = deferred<Pages>()
  const users = deferred<Pages>()
  const page = (name: string, load: () => Promise<Pages>) => lazyPages(name, load)(m => m.Page)
  const ClientPage = page('client', () => clients.promise)
  const UsersPage = page('users', () => users.promise)

  const Shell = () => (
    <div>
      <nav>chrome</nav>
      <Suspense key={usePageChunk(router.routes)} fallback={<PageFallback />}>
        <Outlet />
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

  const view = mountInto(<RouterProvider router={router} />)

  const mount = async () => {
    await view.render()
    await act(async () => { clients.resolve({ Page: () => <div>client page</div> }) })
  }

  return {
    ...view, users, router, mount,
  }
}

describe('the routed page fallback', () => {
  beforeEach(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = true })

  it('renders nothing until the wait is worth reporting', async () => {
    const {
      skeleton, render, unmount,
    } = mountInto(<PageFallback />)

    await render()

    expect(skeleton()).toBeNull()

    await wait(PAST_THE_DELAY)

    expect(skeleton()).not.toBeNull()

    unmount()
  })

  it('never appears when the page is already downloaded', async () => {
    const {
      skeleton, container, mount, router, users, unmount,
    } = setup()

    await mount()
    await act(async () => { await router.navigate('/users') })

    expect(skeleton()).toBeNull()

    await act(async () => { users.resolve({ Page: () => <div>users page</div> }) })
    await wait(PAST_THE_DELAY)

    expect(skeleton()).toBeNull()
    expect(container.textContent).toContain('users page')

    unmount()
  })

  it('appears once the download outlasts the delay', async () => {
    const {
      skeleton, container, mount, router, unmount,
    } = setup()

    await mount()
    await act(async () => { await router.navigate('/users') })

    expect(skeleton()).toBeNull()

    await wait(PAST_THE_DELAY)

    expect(skeleton()).not.toBeNull()
    expect(container.textContent).toContain('chrome')

    unmount()
  })
})
