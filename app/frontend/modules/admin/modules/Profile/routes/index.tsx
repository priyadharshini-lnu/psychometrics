import { Profile } from './Details'
import { ChangePassword } from './ChangePassword'

const routes = [
  { redirect: true, from: '/profile', to: '/profile/details' },
  {
    path: '/profile/details',
    component: () => <Profile />,
  },
  {
    path: '/profile/change_password',
    component: () => <ChangePassword />,
  },
]

export default routes
