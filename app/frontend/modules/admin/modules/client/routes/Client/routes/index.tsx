import { ProjectList } from './ProjectList'
import { Admins } from './Admins'
import { Settings } from './Settings'
import { DataExports } from './DataExports'
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
    path: '/data_exports',
    component: <DataExports />,
  },
  {
    path: '/licenses',
    component: <LicenseList />,
  },
]
