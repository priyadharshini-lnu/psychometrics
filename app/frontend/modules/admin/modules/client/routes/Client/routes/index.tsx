import { ProjectList } from './ProjectList'
import { Admins } from './Admins'
import { Settings } from './Settings'

export const routes = [
  { redirect: true, from: '', to: 'projects' },
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
