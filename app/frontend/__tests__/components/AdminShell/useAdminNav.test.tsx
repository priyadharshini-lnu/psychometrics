import { renderHook } from '@testing-library/react-hooks'
import { MemoryRouter } from 'react-router-dom'
import { Provider } from 'react-redux'
import { configureStore } from '@reduxjs/toolkit'
import { ReactNode } from 'react'
import { useAdminNav } from '~/components/AdminShell/useAdminNav'

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

const renderNav = (links: Record<string, string>, pathname = '/admin/clients') => {
  const store = configureStore({
    reducer: () => ({ ui: { menu: { links, collapsed: false } }, features: {} }),
    preloadedState: undefined,
  })

  const wrapper = ({ children }: { children: ReactNode }) => (
    <Provider store={store}>
      <MemoryRouter initialEntries={[pathname]}>{children}</MemoryRouter>
    </Provider>
  )

  return renderHook(() => useAdminNav(), { wrapper })
}

const flatKeys = (items: NavItems): string[] => (items ?? []).flatMap((item) => {
  if (item == null || !('key' in item) || item.key == null) return []
  const children = 'children' in item && Array.isArray(item.children) ? flatKeys(item.children) : []
  return [String(item.key), ...children]
})

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
})
