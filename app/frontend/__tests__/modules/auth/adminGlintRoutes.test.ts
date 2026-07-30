import { ADMIN_GLINT_ROUTES, isAdminGlintRoute } from '~/modules/auth/adminGlintRoutes'

describe('adminGlintRoutes', () => {
  describe('ADMIN_GLINT_ROUTES', () => {
    test('lists the admin login paths and the admin forgot-password path', () => {
      expect(ADMIN_GLINT_ROUTES).toEqual([
        '/',
        '/administration',
        '/administration/sign_in',
        '/administration/passwords/new',
      ])
    })
  })

  describe('isAdminGlintRoute', () => {
    test.each([
      '/',
      '/administration',
      '/administration/',
      '/administration/sign_in',
      '/administration/passwords/new',
    ])('matches %s', (pathname) => {
      expect(isAdminGlintRoute(pathname)).toBe(true)
    })

    test.each([
      '/users/sign_in',
      '/administration/passwords/edit',
      '/users',
    ])('does not match %s', (pathname) => {
      expect(isAdminGlintRoute(pathname)).toBe(false)
    })
  })
})
