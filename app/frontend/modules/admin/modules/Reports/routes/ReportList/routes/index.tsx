import { ReportList } from './ReportList'
import { EditReport } from './EditReport'

const routes = [
  { redirect: true, from: '', to: '/active' },
  {
    path: '/active',
    component: () => <ReportList reportTab="active" />,
  },
  {
    path: '/archived',
    component: () => <ReportList reportTab="archived" />,
  },
  {
    path: '/trash',
    component: () => <ReportList reportTab="deleted" />,
  },
  {
    path: '/:id/edit',
    component: () => <EditReport />,
  },
]

export default routes
