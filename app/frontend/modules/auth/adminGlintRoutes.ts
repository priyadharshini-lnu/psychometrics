// Imports nothing on purpose: App.tsx loads this eagerly and any glint edge here would defeat the lazy AuthApp split.
export const ADMIN_LOGIN_PATHS = ['/', '/administration', '/administration/sign_in']

export const ADMIN_FORGOT_PASSWORD_PATH = '/administration/passwords/new'

// The bare paths are where Devise re-renders the form after a failed PATCH/PUT.
export const ADMIN_INVITATION_PATHS = ['/administration/invitations/accept', '/administration/invitations']

export const ADMIN_SET_PASSWORD_PATHS = ['/administration/passwords/edit', '/administration/passwords']

export const ADMIN_PASSWORD_EXPIRED_PATH = '/administration/password_expired'

// Devise serves admins and participants from this one path, so it is admin-only via the flag, never by path alone.
export const TWO_FACTOR_PATH = '/users/two_factor_authentication'

export const ADMIN_GLINT_ROUTES = [
  ...ADMIN_LOGIN_PATHS,
  ADMIN_FORGOT_PASSWORD_PATH,
  ...ADMIN_INVITATION_PATHS,
  ...ADMIN_SET_PASSWORD_PATHS,
  ADMIN_PASSWORD_EXPIRED_PATH,
]

export const isAdminGlintRoute = (pathname: string, adminSide = false) => {
  const path = pathname.replace(/\/+$/, '') || '/'

  return ADMIN_GLINT_ROUTES.includes(path) || (adminSide && path === TWO_FACTOR_PATH)
}
