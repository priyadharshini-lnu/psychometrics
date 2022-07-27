import { Login } from './Login'
import { LoginAdmin } from './LoginAdmin'
import { PasswordExpired } from './PasswordExpired'
import { Registration } from './Registration'
import { ResetPassword } from './ResetPassword'
import { SetPassword } from './SetPassword'
import { TwoFactorAuth } from './TwoFactorAuth'

const routes = [
  {
    path: '/',
    main: LoginAdmin,
    exact: true,
  },
  {
    path: '/administration/sign_in',
    main: LoginAdmin,
    exact: true,
  },
  {
    path: '/users/sign_in',
    main: Login,
    exact: true,
  },
  {
    path: '/users/sign_up',
    main: Registration,
    exact: true,
  },
  {
    path: '/users',
    main: Registration,
    exact: true,
  },
  {
    path: '/users/password/new',
    main: ResetPassword,
    exact: true,
  },
  {
    path: '/users/password',
    main: ResetPassword,
    exact: true,
  },
  {
    path: '/users/password',
    main: SetPassword,
    exact: true,
  },
  {
    path: '/users/password/edit',
    main: SetPassword,
    exact: true,
  },
  {
    path: '/users/two_factor_authentication',
    main: TwoFactorAuth,
    exact: true,
  },
  {
    path: '/users/password_expired',
    main: PasswordExpired,
    exact: true,
  },
]

export default routes
