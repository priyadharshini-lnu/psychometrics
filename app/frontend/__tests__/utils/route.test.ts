import routeUtils from '~/utils/route'

const setLocation = (pathname, search = '') => {
  Object.defineProperty(window, 'location', {
    value: { pathname, search },
    writable: true,
    configurable: true,
  })
}
 
describe('routeUtils', () => {
  describe('getBasePath', () => {
    test('extracts base path from static prefix', () => {
      setLocation('/admin/settings/maintenance')
      expect(routeUtils.getBasePath('/admin/settings')).toBe('/admin/settings')
    })

    test('extracts base path with single dynamic :id segment', () => {
      setLocation('/admin/clients/42/projects')
      expect(routeUtils.getBasePath('/admin/clients/:id/projects')).toBe('/admin/clients/42/projects')
    })

    test('extracts base path ignoring trailing path after prefix', () => {
      setLocation('/admin/clients/42/projects/settings/general')
      expect(routeUtils.getBasePath('/admin/clients/:id/projects')).toBe('/admin/clients/42/projects')
    })

    test('extracts base path with multiple dynamic segments', () => {
      setLocation('/administration/new_campaigns/99/user_reports/dashboard')
      expect(routeUtils.getBasePath('/administration/new_campaigns/:campaignId/user_reports/dashboard'))
        .toBe('/administration/new_campaigns/99/user_reports/dashboard')
    })

    test('extracts base path with :projectId param', () => {
      setLocation('/admin/clients/5/projects/10/settings/integrations')
      expect(routeUtils.getBasePath('/admin/clients/:id/projects/:projectId/settings'))
        .toBe('/admin/clients/5/projects/10/settings')
    })

    test('works when prefix matches pathname exactly', () => {
      setLocation('/admin/users')
      expect(routeUtils.getBasePath('/admin/users')).toBe('/admin/users')
    })

    test('handles mixed prefix with :param and actual IDs', () => {
      setLocation('/admin/projects/5/new_campaigns/42/dashboard/overview')
      expect(routeUtils.getBasePath('/admin/projects/:projectId/new_campaigns/42/dashboard'))
        .toBe('/admin/projects/5/new_campaigns/42/dashboard')
    })
  })

  describe('moveTo', () => {
    test('navigates to the correct URL', () => {
      setLocation('/admin/settings/maintenance')
      const navigate = vi.fn()
      routeUtils.moveTo(navigate, '/admin/settings', '/general')
      expect(navigate).toHaveBeenCalledWith('/admin/settings/general', { state: {} })
    })

    test('replaces history when replace is true', () => {
      setLocation('/admin/settings/maintenance')
      const navigate = vi.fn()
      routeUtils.moveTo(navigate, '/admin/settings', '/general', true)
      expect(navigate).toHaveBeenCalledWith('/admin/settings/general', { replace: true })
    })

    test('navigates with dynamic prefix', () => {
      setLocation('/admin/clients/5/projects/10/settings/integrations')
      const navigate = vi.fn()
      routeUtils.moveTo(navigate, '/admin/clients/:id/projects/:projectId/settings', '/general')
      expect(navigate).toHaveBeenCalledWith('/admin/clients/5/projects/10/settings/general', { state: {} })
    })
  })

  describe('getActiveRoutePath', () => {
    test('returns matching route path', () => {
      setLocation('/admin/users/active')
      const routes = [{ path: '/active' }, { path: '/inactive' }]
      expect(routeUtils.getActiveRoutePath(routes)).toBe('/active')
    })

    test('returns null when no route matches', () => {
      setLocation('/admin/users')
      const routes = [{ path: '/active' }, { path: '/inactive' }]
      expect(routeUtils.getActiveRoutePath(routes)).toBeNull()
    })
  })

  describe('getPage', () => {
    test('returns page number from query string', () => {
      setLocation('/', '?page=3')
      expect(routeUtils.getPage()).toBe(3)
    })

    test('returns 1 when no page param', () => {
      setLocation('/', '')
      expect(routeUtils.getPage()).toBe(1)
    })
  })

  describe('getSearchTerm', () => {
    test('returns search term from query string', () => {
      setLocation('/', '?search=hello')
      expect(routeUtils.getSearchTerm()).toBe('hello')
    })

    test('returns null when no search param', () => {
      setLocation('/', '')
      expect(routeUtils.getSearchTerm()).toBeNull()
    })
  })
})
