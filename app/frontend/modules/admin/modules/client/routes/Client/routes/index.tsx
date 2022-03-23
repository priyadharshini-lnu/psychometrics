import { ProjectList } from 'modules/admin/modules/client/routes/Client/routes/ProjectList/ProjectList'

export const routes = [
  {
    path: '/clients/:clientId/projects',
    component: ProjectList,
  },
]
