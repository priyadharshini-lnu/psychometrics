import { ADMIN_GLINT_ROUTES, isAdminGlintRoute } from '~/modules/auth/adminGlintRoutes'

describe('adminGlintRoutes', () => {
  describe('ADMIN_GLINT_ROUTES', () => {
    test('lists every admin path served by a glint page', () => {
      expect(ADMIN_GLINT_ROUTES).toEqual([
        '/',
        '/administration',
        '/administration/sign_in',
        '/administration/passwords/new',
        '/administration/invitations/accept',
        '/administration/invitations',
        '/administration/passwords/edit',
        '/administration/passwords',
        '/administration/password_expired',
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
      '/administration/passwords/edit',
      '/administration/passwords',
      '/administration/invitations/accept',
      '/administration/invitations',
      '/administration/password_expired',
    ])('matches %s', (pathname) => {
      expect(isAdminGlintRoute(pathname)).toBe(true)
    })

    test.each([
      '/users/sign_in',
      '/users/password/edit',
      '/users',
    ])('does not match %s', (pathname) => {
      expect(isAdminGlintRoute(pathname)).toBe(false)
    })
  })
})
