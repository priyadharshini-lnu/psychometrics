import { ProjectList } from './ProjectList'
import { Admins } from './Admins'
import { Assessors } from './Assessors'
import { Settings } from './Settings'
import { DataReports } from './DataReports'
import { DataReportJobs } from './DataReports/DataReportJobs'
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
    path: '/assessors',
    component: <Assessors />,
  },
  {
    path: '/settings/*',
    component: <Settings />,
  },
  {
    path: '/audit_reports',
    component: <DataExports />,
  },
  {
    path: '/licenses',
    component: <LicenseList />,
  },
  {
    path: '/data_reports',
    component: <DataReports />,
  },
  {
    path: '/data_reports/:id',
    component: <DataReportJobs />,
  },
]
