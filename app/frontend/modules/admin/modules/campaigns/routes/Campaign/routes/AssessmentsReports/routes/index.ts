import Manage from './Manage'
import { Sequencing } from './Sequencing'

const routes = [
  { redirect: true, from: '/', to: '/manage' },
  { path: '/manage', component: Manage },
  { path: '/sequencing', component: Sequencing },
]

export default routes
