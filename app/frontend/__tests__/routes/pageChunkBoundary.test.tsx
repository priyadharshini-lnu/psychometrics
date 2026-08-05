import { Suspense, useEffect } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { Outlet, RouterProvider, createMemoryRouter } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'
import { usePageChunk } from '~/utils/usePageChunk'

type Pages = { List: ComponentType, Detail: ComponentType }

const deferred = <T, >() => {
  let resolve: (value: T) => void = () => {}
  const promise = new Promise<T>((settle) => { resolve = settle })

  return { promise, resolve }
}

const pages = (name: string) => ({
  List: () => <div>{`${name} list`}</div>,
  Detail: () => <div>{`${name} detail`}</div>,
})

// A concurrent root, not the legacy one @testing-library/react v11 renders with: only there does a transition hold.
const setup = ({ keyed }: { keyed: boolean }) => {
  const clients = deferred<Pages>()
  const users = deferred<Pages>()
  const clientPage = lazyPages('client', () => clients.promise)
  const userPage = lazyPages('users', () => users.promise)
  const fallbacksShown: number[] = []

  const Fallback = () => {
    useEffect(() => { fallbacksShown.push(1) }, [])

    return <div>loading</div>
  }

  const Shell = () => {
    const chunk = usePageChunk(router.routes)

    return (
      <div>
        <nav>chrome</nav>
        <Suspense key={keyed ? chunk : undefined} fallback={<Fallback />}>
          <Outlet />
        </Suspense>
      </div>
    )
  }

  const ClientList = clientPage(m => m.List)
  const Client = clientPage(m => m.Detail)
  const UserList = userPage(m => m.List)

  const router = createMemoryRouter([
    {
      path: '/',
      element: <Shell />,
      children: [
        { path: 'clients', element: <ClientList /> },
        { path: 'clients/:clientId', element: <Client /> },
        { path: 'users', element: <UserList /> },
      ],
    },
  ], { initialEntries: ['/clients'] })

  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  const mount = async () => {
    await act(async () => { root.render(<RouterProvider router={router} />) })
    await act(async () => { clients.resolve(pages('client')) })
    fallbacksShown.length = 0
  }

  const navigate = async (to: string) => { await act(async () => { await router.navigate(to) }) }

  return {
    clients, users, container, root, mount, navigate, fallbacksShown,
  }
}

describe('the routed page suspense boundary', () => {
  beforeEach(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = true })

  it('shows the fallback under the chrome while another chunk downloads', async () => {
    const {
      container, root, mount, navigate, fallbacksShown,
    } = setup({ keyed: true })

    await mount()
    expect(container.textContent).toContain('client list')

    await navigate('/users')

    expect(fallbacksShown).toHaveLength(1)
    expect(container.textContent).toContain('loading')
    expect(container.textContent).toContain('chrome')
    expect(container.textContent).not.toContain('client list')

    act(() => { root.unmount() })
  })

  it('keeps the page mounted while a route from the same chunk renders', async () => {
    const {
      container, root, mount, navigate, fallbacksShown,
    } = setup({ keyed: true })

    await mount()
    await navigate('/clients/1')

    expect(fallbacksShown).toHaveLength(0)
    expect(container.textContent).toContain('client detail')

    act(() => { root.unmount() })
  })

  it('leaves the previous page on screen without the key', async () => {
    const {
      container, root, mount, navigate, fallbacksShown,
    } = setup({ keyed: false })

    await mount()
    await navigate('/users')

    expect(fallbacksShown).toHaveLength(0)
    expect(container.textContent).toContain('client list')

    act(() => { root.unmount() })
  })
})
