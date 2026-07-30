// Imports nothing on purpose: App.tsx loads this eagerly and any glint edge here would defeat the lazy AuthApp split.
export const ADMIN_LOGIN_PATHS = ['/', '/administration', '/administration/sign_in']

export const ADMIN_FORGOT_PASSWORD_PATH = '/administration/passwords/new'

export const ADMIN_GLINT_ROUTES = [...ADMIN_LOGIN_PATHS, ADMIN_FORGOT_PASSWORD_PATH]

export const isAdminGlintRoute = (pathname: string) => (
  ADMIN_GLINT_ROUTES.includes(pathname.replace(/\/+$/, '') || '/')
)
