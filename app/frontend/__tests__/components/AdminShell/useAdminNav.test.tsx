import { renderHook } from '@testing-library/react-hooks'
import { render, screen } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { MemoryRouter, useLocation } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { FC, ReactNode } from 'react'
import { useAdminNav } from '~/components/AdminShell/useAdminNav'

type NavItems = ReturnType<typeof useAdminNav>['items']
type NavItem = NonNullable<NavItems>[number]

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

// Stands in for the antd Menu: it supplies the MenuInfo antd would pass so an entry can be clicked by key.
const navButton = (item: NavItem) => {
  if (item == null || !('onClick' in item) || item.onClick == null) return null
  const { key, onClick } = item

  return (
    <button
      key={String(key)}
      type="button"
      data-testid={String(key)}
      onClick={event => onClick({
        key: String(key), keyPath: [String(key)], item: event.currentTarget, domEvent: event,
      })}
    />
  )
}

const Probe: FC<{ ownedPathPrefixes?: string[] }> = ({ ownedPathPrefixes }) => {
  const { items } = useAdminNav(ownedPathPrefixes)
  const { pathname } = useLocation()

  return (
    <>
      <span data-testid="pathname">{pathname}</span>
      {(items ?? []).map(navButton)}
    </>
  )
}

type ProbeOptions = { pathname: string, ownedPathPrefixes?: string[] }

const renderProbe = (links: Record<string, string>, { pathname, ownedPathPrefixes }: ProbeOptions) => {
  const store = makeStore(links)

  render(
    <Provider store={store}>
      <MemoryRouter initialEntries={[pathname]}>
        <Probe ownedPathPrefixes={ownedPathPrefixes} />
      </MemoryRouter>
    </Provider>,
  )
}

const currentPathname = () => screen.getByTestId('pathname').textContent

describe('useAdminNav', () => {
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

  describe('navigation', () => {
    const originalLocation = window.location

    beforeEach(() => {
      Object.defineProperty(window, 'location', {
        value: { href: '' },
        writable: true,
        configurable: true,
      })
    })

    afterEach(() => {
      Object.defineProperty(window, 'location', {
        value: originalLocation,
        writable: true,
        configurable: true,
      })
    })

    it('pushes a path the mounted router owns', async () => {
      renderProbe(ALL_LINKS, { pathname: '/admin/clients', ownedPathPrefixes: ['/admin'] })

      await userEvent.click(screen.getByTestId('users'))

      expect(currentPathname()).toEqual('/admin/users')
      expect(window.location.href).toEqual('')
    })

    it('pushes the prefix itself', async () => {
      renderProbe({ ...ALL_LINKS, dashboards: '/admin' }, { pathname: '/admin/clients', ownedPathPrefixes: ['/admin'] })

      await userEvent.click(screen.getByTestId('dashboards'))

      expect(currentPathname()).toEqual('/admin')
      expect(window.location.href).toEqual('')
    })

    it('accepts a prefix written with a trailing slash', async () => {
      renderProbe(ALL_LINKS, { pathname: '/admin/clients', ownedPathPrefixes: ['/admin/'] })

      await userEvent.click(screen.getByTestId('users'))

      expect(currentPathname()).toEqual('/admin/users')
      expect(window.location.href).toEqual('')
    })

    it('full-loads a path that only shares a string prefix', async () => {
      const links = { ...ALL_LINKS, communicationCenter: '/administration/communications' }
      renderProbe(links, { pathname: '/admin/clients', ownedPathPrefixes: ['/admin'] })

      await userEvent.click(screen.getByTestId('communicationCenter'))

      expect(window.location.href).toEqual('/administration/communications')
      expect(currentPathname()).toEqual('/admin/clients')
    })

    it('full-loads a path the mounted router does not own', async () => {
      renderProbe(ASSESSOR_LINKS, { pathname: '/admin/clients', ownedPathPrefixes: ['/admin'] })

      await userEvent.click(screen.getByTestId('assessorDashboard'))

      expect(window.location.href).toEqual('/assessors')
      expect(currentPathname()).toEqual('/admin/clients')
    })

    it('pushes a path under any of several owned prefixes', async () => {
      renderProbe(ASSESSOR_LINKS, { pathname: '/admin/clients', ownedPathPrefixes: ['/admin', '/assessors'] })

      await userEvent.click(screen.getByTestId('assessorWorkshops'))
      expect(currentPathname()).toEqual('/assessors/assessment_centers')

      await userEvent.click(screen.getByTestId('users'))
      expect(currentPathname()).toEqual('/admin/users')

      expect(window.location.href).toEqual('')
    })

    it('pushes an assessor path inside the assessor app', async () => {
      renderProbe(ASSESSOR_LINKS, { pathname: '/assessors', ownedPathPrefixes: ['/assessors'] })

      await userEvent.click(screen.getByTestId('assessorWorkshops'))

      expect(currentPathname()).toEqual('/assessors/assessment_centers')
      expect(window.location.href).toEqual('')
    })

    it('full-loads an admin path from inside the assessor app', async () => {
      renderProbe(ASSESSOR_LINKS, { pathname: '/assessors', ownedPathPrefixes: ['/assessors'] })

      await userEvent.click(screen.getByTestId('clients'))

      expect(window.location.href).toEqual('/admin/clients')
      expect(currentPathname()).toEqual('/assessors')
    })

    it('full-loads every main-menu target when the router owns none of them', async () => {
      renderProbe(ASSESSOR_LINKS, { pathname: '/admin/projects/1/new_campaigns/2/participants' })

      await userEvent.click(screen.getByTestId('clients'))
      expect(window.location.href).toEqual('/admin/clients')

      await userEvent.click(screen.getByTestId('users'))
      expect(window.location.href).toEqual('/admin/users')

      expect(currentPathname()).toEqual('/admin/projects/1/new_campaigns/2/participants')
    })
  })
})
