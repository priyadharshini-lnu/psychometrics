import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import { Outlet, RouterProvider, createMemoryRouter } from 'react-router-dom'
import type { RouteObject } from 'react-router-dom'
import { lazyPages } from '~/utils/lazyPages'
import { PREFETCH_DWELL, usePagePrefetch } from '~/utils/usePagePrefetch'

type Pages = { Page: ComponentType }

const setup = () => {
  const started: string[] = []
  let api: ReturnType<typeof usePagePrefetch> | undefined

  const module = (name: string, fails = false) => lazyPages(name, () => {
    started.push(name)

    return fails ? Promise.reject(new Error(name)) : Promise.resolve<Pages>({ Page: () => <div>{name}</div> })
  })

  const ClientPage = module('client')(m => m.Page)
  const UsersPage = module('users')(m => m.Page)
  const BrokenPage = module('broken', true)(m => m.Page)

  const Harness = () => {
    api = usePagePrefetch(router.routes)

    return <Outlet />
  }

  const routes: RouteObject[] = [{
    path: '/',
    element: <Harness />,
    children: [
      { path: 'clients', element: <ClientPage /> },
      { path: 'users', element: <UsersPage /> },
      { path: 'broken', element: <BrokenPage /> },
    ],
  }]

  const router = createMemoryRouter(routes, { initialEntries: ['/'] })
  const container = document.createElement('div')
  document.body.appendChild(container)
  const root = createRoot(container)

  const mount = async () => { await act(async () => { root.render(<RouterProvider router={router} />) }) }
  const hover = (path: string) => act(() => { api?.prefetch(path) })
  const leave = () => act(() => { api?.cancel() })
  const dwell = (ms: number) => act(() => { vi.advanceTimersByTime(ms) })

  return {
    started, router, container, root, mount, hover, leave, dwell,
  }
}

describe('prefetching a page on intent', () => {
  beforeEach(() => {
    globalThis.IS_REACT_ACT_ENVIRONMENT = true
    vi.useFakeTimers()
  })

  afterEach(() => { vi.useRealTimers() })

  it('waits for the pointer to settle before downloading', async () => {
    const {
      started, mount, hover, dwell, root,
    } = setup()

    await mount()
    hover('/users')
    dwell(PREFETCH_DWELL - 1)

    expect(started).toEqual([])

    dwell(1)

    expect(started).toEqual(['users'])

    act(() => { root.unmount() })
  })

  it('downloads nothing for items the pointer only passes over', async () => {
    const {
      started, mount, hover, dwell, root,
    } = setup()

    await mount()
    hover('/clients')
    dwell(PREFETCH_DWELL - 1)
    hover('/users')
    dwell(PREFETCH_DWELL)

    expect(started).toEqual(['users'])

    act(() => { root.unmount() })
  })

  it('drops the download when the pointer leaves', async () => {
    const {
      started, mount, hover, leave, dwell, root,
    } = setup()

    await mount()
    hover('/users')
    leave()
    dwell(PREFETCH_DWELL * 10)

    expect(started).toEqual([])

    act(() => { root.unmount() })
  })

  it('ignores a path this router does not serve', async () => {
    const {
      started, mount, hover, dwell, root,
    } = setup()

    await mount()
    hover('/administration/assessments')
    dwell(PREFETCH_DWELL)

    expect(started).toEqual([])

    act(() => { root.unmount() })
  })

  it('shares its download with the page that renders next', async () => {
    const {
      started, mount, hover, dwell, router, container, root,
    } = setup()

    await mount()
    hover('/users')
    dwell(PREFETCH_DWELL)
    await act(async () => { await router.navigate('/users') })

    expect(started).toEqual(['users'])
    expect(container.textContent).toEqual('users')

    act(() => { root.unmount() })
  })

  it('lets the next attempt import again when a prefetch fails', async () => {
    const {
      started, mount, hover, dwell, root,
    } = setup()

    await mount()
    hover('/broken')
    dwell(PREFETCH_DWELL)
    await act(async () => {})
    hover('/broken')
    dwell(PREFETCH_DWELL)

    expect(started).toEqual(['broken', 'broken'])

    act(() => { root.unmount() })
  })
})
