import {
  act, fireEvent, render, renderHook, screen,
} from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { BrowserRouter, MemoryRouter, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { FC, ReactNode, useEffect } from 'react'
import { Menu } from 'antd'
import type { RouteObject } from 'react-router-dom'
import { useAdminNav } from '~/components/AdminShell/useAdminNav'
import { SubnavProvider, useRegisterSubnav } from '~/components/AdminShell/SubnavContext'
import { lazyPages } from '~/utils/lazyPages'
import { PREFETCH_DWELL } from '~/utils/usePagePrefetch'

type NavItems = ReturnType<typeof useAdminNav>['items']

// `state.ui.menu.links` is the permission gate: a key exists only when the user may see it.
const ALL_LINKS = {
  dashboards: '/admin/dashboards',
  clients: '/admin/clients',
  users: '/admin/users',
  assessments: '/admin/assessments',
  norms: '/admin/norms',
  reports: '/admin/reports',
  auditLogs: '/admin/audit_logs',
}

// A user who is both global assessor and super admin: the rail mixes both apps' links.
const ASSESSOR_LINKS = {
  ...ALL_LINKS,
  assessorDashboard: '/assessors',
  assessorWorkshops: '/assessors/assessment_centers',
}

const makeStore = (links: Record<string, string>) => configureStore({
  reducer: () => ({ ui: { menu: { links, collapsed: false } }, features: {} }),
  preloadedState: undefined,
})

const renderNav = (links: Record<string, string>, pathname = '/admin/clients', ownedPathPrefixes = ['/admin']) => {
  const store = makeStore(links)

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
    </Provider>
  )

  return renderHook(() => useAdminNav(ownedPathPrefixes), { wrapper })
}

const flatKeys = (items: NavItems): string[] => (items ?? []).flatMap((item) => {
  if (item == null || !('key' in item) || item.key == null) return []
  const children = 'children' in item && Array.isArray(item.children) ? flatKeys(item.children) : []
  return [String(item.key), ...children]
})

type ProbeOptions = { pathname: string, ownedPathPrefixes?: string[] }

const NavMenu: FC<{ ownedPathPrefixes?: string[] }> = ({ ownedPathPrefixes }) => (
  <Menu mode="inline" items={useAdminNav(ownedPathPrefixes).items} />
)

const Pathname: FC = () => <span data-testid="pathname">{useLocation().pathname}</span>

const SectionNav: FC = () => {
  useRegisterSubnav([{ key: 'participants', label: 'Participants' }], ['participants'])

  return null
}

type MenuOptions = { withSubnav?: boolean }

// The real antd Menu is the assertion surface: whether an item is a link is a fact about its own markup.
const renderMenu = (
  links: Record<string, string>,
  { pathname, ownedPathPrefixes }: ProbeOptions,
  { withSubnav }: MenuOptions = {},
) => render(
  <Provider store={makeStore(links)}>
    <MemoryRouter initialEntries={[pathname]}>
      <SubnavProvider>
        {withSubnav ? <SectionNav /> : null}
        <NavMenu ownedPathPrefixes={ownedPathPrefixes} />
      </SubnavProvider>
      <Pathname />
    </MemoryRouter>
  </Provider>,
)

// React batches a double navigate into one render, so only the history calls themselves can count the pushes.
const renderOnRealHistory = (links: Record<string, string>, { pathname, ownedPathPrefixes }: ProbeOptions) => {
  window.history.pushState({}, '', pathname)
  const pushes = vi.spyOn(window.history, 'pushState')

  render(
    <Provider store={makeStore(links)}>
      <BrowserRouter>
        <NavMenu ownedPathPrefixes={ownedPathPrefixes} />
      </BrowserRouter>
    </Provider>,
  )

  return pushes
}

const navItem = (key: string): HTMLElement => {
  const item = document.querySelector(`li[data-menu-id$="-${key}"]`)

  if (!(item instanceof HTMLElement)) throw new Error(`the ${key} nav item did not render`)

  return item
}

const navLink = (key: string): HTMLAnchorElement => {
  const link = navItem(key).querySelector('a')

  if (!(link instanceof HTMLAnchorElement)) throw new Error(`the ${key} nav item is not a link`)

  return link
}

const currentPathname = () => screen.getByTestId('pathname').textContent

describe('useAdminNav', () => {
  // jsdom cannot follow an anchor, so swallow the default and read the router instead of a would-be page load.
  const swallow = (event: Event) => event.preventDefault()

  beforeEach(() => { document.addEventListener('click', swallow) })
  afterEach(() => { document.removeEventListener('click', swallow); vi.restoreAllMocks() })

  it('omits entries the user has no permission for', () => {
    const { result } = renderNav({ clients: '/admin/clients' })
    const keys = flatKeys(result.current.items)

    expect(keys).toContain('clients')
    expect(keys).not.toContain('users')
    expect(keys).not.toContain('auditLogs')
  })

  it('drops a group whose children are all denied', () => {
    const { result } = renderNav({ clients: '/admin/clients' })
    const keys = flatKeys(result.current.items)

    expect(keys).not.toContain('content')
  })

  it('keeps a group when at least one child is permitted', () => {
    const { result } = renderNav({ assessments: '/admin/assessments' })
    const keys = flatKeys(result.current.items)

    expect(keys).toContain('content')
    expect(keys).toContain('assessments')
    expect(keys).not.toContain('norms')
  })

  it.each([
    ['/admin/clients', 'clients'],
    ['/admin/projects/12', 'clients'],
    ['/admin/users/global-assessors', 'users'],
    ['/admin/audit_logs', 'auditLogs'],
    ['/administration/assessments', 'assessments'],
    ['/assessors/assessment_centers', 'assessorWorkshops'],
  ])('marks %s as selecting %s', (pathname, expected) => {
    const { result } = renderNav(ALL_LINKS, pathname)

    expect(result.current.selectedKeys).toEqual([expected])
  })

  it('selects nothing on a route the table does not cover', () => {
    const { result } = renderNav(ALL_LINKS, '/admin/something-unmapped')

    expect(result.current.selectedKeys).toEqual([])
  })

  it('opens the submenu owning the active route', () => {
    const { result } = renderNav(ALL_LINKS, '/admin/assessments')

    expect(result.current.openKeys).toContain('content')
  })

  describe('links', () => {
    it('renders an owned path as a router link that navigates without a page load', async () => {
      renderMenu(ALL_LINKS, { pathname: '/admin/clients', ownedPathPrefixes: ['/admin'] })

      expect(navLink('users')).toHaveAttribute('href', '/admin/users')

      await userEvent.click(navLink('users'))

      expect(currentPathname()).toEqual('/admin/users')
    })

    it('renders a path the router does not own as a plain anchor it leaves alone', async () => {
      const links = { ...ALL_LINKS, communicationCenter: '/administration/communications' }
      renderMenu(links, { pathname: '/admin/clients', ownedPathPrefixes: ['/admin'] })

      expect(navLink('communicationCenter')).toHaveAttribute('href', '/administration/communications')

      await userEvent.click(navLink('communicationCenter'))

      expect(currentPathname()).toEqual('/admin/clients')
    })

    it('links a path under any of several owned prefixes', async () => {
      renderMenu(ASSESSOR_LINKS, { pathname: '/admin/clients', ownedPathPrefixes: ['/admin', '/assessors'] })

      await userEvent.click(navLink('assessorWorkshops'))

      expect(currentPathname()).toEqual('/assessors/assessment_centers')
    })

    it('gives every entry an anchor even when the router owns none of them', () => {
      renderMenu(ASSESSOR_LINKS, { pathname: '/assessors' })

      expect(navLink('clients')).toHaveAttribute('href', '/admin/clients')
      expect(navLink('assessorDashboard')).toHaveAttribute('href', '/assessors')
    })

    it('leaves the submenu toggle an action rather than a link', () => {
      renderMenu(ALL_LINKS, { pathname: '/admin/clients', ownedPathPrefixes: ['/admin'] }, { withSubnav: true })

      expect(navItem('showSubmenu').querySelector('a')).toBeNull()
    })

    it('adds exactly one history entry for a click on the anchor', async () => {
      const pushes = renderOnRealHistory(ALL_LINKS, { pathname: '/admin/clients', ownedPathPrefixes: ['/admin'] })

      await userEvent.click(navLink('users'))

      expect(window.location.pathname).toEqual('/admin/users')
      expect(pushes).toHaveBeenCalledTimes(1)
    })
  })

  describe('prefetching', () => {
    const probe = () => {
      const started: string[] = []
      const UsersPage = lazyPages('users', () => {
        started.push('users')

        return Promise.resolve({ Page: () => null })
      })(m => m.Page)
      const routes: RouteObject[] = [{ path: '/admin/users', element: <UsersPage /> }]

      const NavMenu: FC = () => <Menu mode="inline" items={useAdminNav(['/admin'], routes).items} />

      const { container } = render(
        <Provider store={makeStore(ALL_LINKS)}>
          <MemoryRouter initialEntries={['/admin/clients']}>
            <NavMenu />
          </MemoryRouter>
        </Provider>,
      )
      const item = container.querySelector('li[data-menu-id$="-users"]')

      if (!(item instanceof HTMLElement)) throw new Error('the users nav item did not render')

      vi.useFakeTimers()

      return { started, item }
    }

    const dwell = (ms: number) => act(() => { vi.advanceTimersByTime(ms) })

    afterEach(() => { vi.useRealTimers() })

    it('downloads the page once the pointer has settled on its item', () => {
      const { started, item } = probe()

      fireEvent.mouseOver(item)
      dwell(PREFETCH_DWELL - 1)

      expect(started).toEqual([])

      dwell(1)

      expect(started).toEqual(['users'])
    })

    it('downloads the page once the item takes keyboard focus', () => {
      const { started, item } = probe()

      fireEvent.focusIn(item)
      dwell(PREFETCH_DWELL)

      expect(started).toEqual(['users'])
    })

    it('downloads nothing when the pointer moves away first', () => {
      const { started, item } = probe()

      fireEvent.mouseOver(item)
      fireEvent.mouseOut(item)
      dwell(PREFETCH_DWELL)

      expect(started).toEqual([])
    })

    it('downloads nothing when focus moves away first', () => {
      const { started, item } = probe()

      fireEvent.focusIn(item)
      fireEvent.focusOut(item)
      dwell(PREFETCH_DWELL)

      expect(started).toEqual([])
    })
  })
})
