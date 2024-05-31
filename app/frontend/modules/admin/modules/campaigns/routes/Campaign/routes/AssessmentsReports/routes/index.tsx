import Manage from './Manage'
import { Sequencing } from './Sequencing'
import { ReportApprovalSetting } from './ReportApprovalSetting'

const routes = [
  { redirect: true, from: '/', to: 'manage' },
  { path: '/manage', component: <Manage /> },
  { path: '/manage/:tab', component: <Manage /> },
  { path: '/sequencing', component: <Sequencing /> },
  { path: '/report_approval', component: <ReportApprovalSetting /> },
]

export default routes
