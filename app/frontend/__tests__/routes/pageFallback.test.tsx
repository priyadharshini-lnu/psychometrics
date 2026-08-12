import type { ComponentType } from 'react'
import { createRoot } from 'react-dom/client'
import { act } from 'react-dom/test-utils'
import {
  Outlet, RouterProvider, createMemoryRouter, useNavigation,
} from 'react-router-dom'
import { FALLBACK_DELAY, PageFallback } from '~/components/PageFallback'

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

  const Shell = () => <div><nav>chrome</nav><Outlet /></div>

  const PageArea = () => (
    useNavigation().state === 'idle' ? <Outlet /> : <PageFallback />
  )

  const router = createMemoryRouter([{
    path: '/',
    element: <Shell />,
    children: [{
      element: <PageArea />,
      hydrateFallbackElement: <PageFallback />,
      children: [
        { path: 'clients', lazy: async () => ({ Component: (await clients.promise).Page }) },
        { path: 'users', lazy: async () => ({ Component: (await users.promise).Page }) },
      ],
    }],
  }], { initialEntries: ['/clients'] })

  const container = document.body.appendChild(document.createElement('div'))
  const root = createRoot(container)
  const skeleton = () => container.querySelector('[role="status"]')

  const mount = async () => {
    act(() => { root.render(<RouterProvider router={router} />) })
    await wait(0)
    clients.resolve({ Page: () => <div>client page</div> })
    await wait(0)
  }

  const navigate = async (to: string) => { act(() => { void router.navigate(to) }); await wait(0) }
  const unmount = () => { act(() => { root.unmount() }); container.remove() }

  return {
    container, skeleton, users, mount, navigate, unmount,
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
      skeleton, container, mount, navigate, users, unmount,
    } = setup()

    await mount()
    await navigate('/users')

    expect(skeleton()).toBeNull()

    users.resolve({ Page: () => <div>users page</div> })
    await wait(PAST_THE_DELAY)

    expect(skeleton()).toBeNull()
    expect(container.textContent).toContain('users page')

    unmount()
  })

  it('appears once the download outlasts the delay', async () => {
    const {
      skeleton, container, mount, navigate, unmount,
    } = setup()

    await mount()
    await navigate('/users')

    expect(skeleton()).toBeNull()

    await wait(PAST_THE_DELAY)

    expect(skeleton()).not.toBeNull()
    expect(container.textContent).toContain('chrome')

    unmount()
  })
})
