import { ProjectList } from '~/modules/admin/modules/client/routes/Client/routes/ProjectList/ProjectList'
import { Admins } from './Admins'

export const routes = [
  {
    path: '/clients/:clientId/projects',
    component: ProjectList,
  },
  {
    path: '/clients/:clientId/admins',
    component: Admins,
  },
]
