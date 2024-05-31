import { ProjectList } from './ProjectList'
import { Admins } from './Admins'
import { Settings } from './Settings'

export const routes = [
  {
    path: '/projects',
    component: <ProjectList />,
  },
  {
    path: '/admins',
    component: <Admins />,
  },
  {
    path: '/settings',
    component: <Settings />,
  },
]
