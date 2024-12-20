import { ProjectList } from './ProjectList'
import { Admins } from './Admins'
import { Settings } from './Settings'
import LicenseList from '../../LicenseList'

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
  {
    path: '/licenses',
    component: <LicenseList />,
  },
]
