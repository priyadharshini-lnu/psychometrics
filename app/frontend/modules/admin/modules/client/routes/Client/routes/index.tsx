import { ProjectList } from './ProjectList'
import { Admins } from './Admins'
import { Settings } from './Settings'

export const routes = [
  {
    path: '/clients/:clientId/projects',
    component: ProjectList,
  },
  {
    path: '/clients/:clientId/admins',
    component: Admins,
  },
  {
    path: '/clients/:clientId/settings',
    component: Settings,
  },
]
