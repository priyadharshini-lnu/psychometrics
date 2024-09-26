import { lazy } from 'react'
import RouteList from '~/components/RouteList'

const ReportList = lazy(() => import('./ReportList/routes/ReportList'))
const EditReport = lazy(() => import('./ReportList/routes/EditReport'))
const ReportBundleList = lazy(() => import('./ReportBundleList'))
const ReportBundleReportList = lazy(() => import('./ReportBundleReportList'))

const ActiveReportList = () => <ReportList reportTab="active" />
const ArchivedReportList = () => <ReportList reportTab="archived" />
const TrashReportList = () => <ReportList reportTab="deleted" />

const routes = [
  { redirect: true, from: '', to: 'active' },
  {
    path: '/active',
    component: <ActiveReportList />,
  },
  {
    path: '/archived',
    component: <ArchivedReportList />,
  },
  {
    path: '/trash',
    component: <TrashReportList />,
  },
  {
    path: '/:id/edit',
    component: <EditReport />,
  },
]

const Layout = () => <RouteList routes={routes} urlPrefix="" />

const ReportRoutes = [
  {
    path: '/reports/*',
    component: <Layout />,
  },
  {
    path: '/report_families/:id/reports',
    component: <ReportBundleReportList />,
  },
  {
    path: '/report_families',
    component: <ReportBundleList />,
  },
]

export default ReportRoutes
