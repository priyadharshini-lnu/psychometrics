import { useEffect } from 'react'
import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import {
  Outlet, RouterProvider, createMemoryRouter, useNavigation,
} from 'react-router-dom'

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
const setup = () => {
  const clients = deferred<Pages>()
  const users = deferred<Pages>()
  const fallbacksShown: number[] = []

  const Fallback = () => {
    useEffect(() => { fallbacksShown.push(1) }, [])

    return <div>loading</div>
  }

  const Shell = () => <div><nav>chrome</nav><Outlet /></div>

  // The shell's page area: the router resolves a chunk before it renders, so pending navigation is the cue.
  const PageArea = () => (
    useNavigation().state === 'idle' ? <Outlet /> : <Fallback />
  )

  const router = createMemoryRouter([{
    path: '/',
    element: <Shell />,
    children: [{
      element: <PageArea />,
      hydrateFallbackElement: <Fallback />,
      children: [
        { path: 'clients', lazy: async () => ({ Component: (await clients.promise).List }) },
        { path: 'users', lazy: async () => ({ Component: (await users.promise).List }) },
      ],
    }],
  }], { initialEntries: ['/clients'] })

  const container = document.body.appendChild(document.createElement('div'))
  const root = createRoot(container)

  // A pending lazy route holds `router.navigate`, so every step settles the queue instead of awaiting the router.
  const flush = () => act(async () => { await new Promise((resume) => { setTimeout(resume, 0) }) })

  const render = async () => { act(() => { root.render(<RouterProvider router={router} />) }); await flush() }

  const mount = async () => {
    await render()
    clients.resolve(pages('client'))
    await flush()
    fallbacksShown.length = 0
  }

  const navigate = async (to: string) => { act(() => { void router.navigate(to) }); await flush() }
  const unmount = () => { act(() => { root.unmount() }); container.remove() }

  return {
    clients, users, container, render, mount, navigate, unmount, fallbacksShown,
  }
}

describe('the routed page area while a chunk downloads', () => {
  beforeEach(() => { globalThis.IS_REACT_ACT_ENVIRONMENT = true })

  it('shows the shell with a skeleton in the page area on the first load', async () => {
    const {
      container, render, unmount,
    } = setup()

    await render()

    expect(container.textContent).toContain('chrome')
    expect(container.textContent).toContain('loading')

    unmount()
  })

  it('shows the fallback under the chrome while another chunk downloads', async () => {
    const {
      container, mount, navigate, unmount, fallbacksShown,
    } = setup()

    await mount()

    expect(container.textContent).toContain('client list')

    await navigate('/users')

    expect(fallbacksShown).toHaveLength(1)
    expect(container.textContent).toContain('loading')
    expect(container.textContent).toContain('chrome')
    expect(container.textContent).not.toContain('client list')

    unmount()
  })

  it('renders the page once its chunk arrives', async () => {
    const {
      container, users, mount, navigate, unmount,
    } = setup()

    await mount()
    await navigate('/users')
    await act(async () => { users.resolve(pages('users')) })

    expect(container.textContent).toContain('users list')
    expect(container.textContent).toContain('chrome')

    unmount()
  })
})
