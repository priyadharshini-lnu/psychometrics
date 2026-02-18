import Manage from './Manage'
import { Sequencing } from './Sequencing'
import { ReportApprovalSetting } from './ReportApprovalSetting'
import { AIScoringApprovalSetting } from './AIScoringApprovalSetting'

const routes = [
  { redirect: true, from: '/', to: 'manage' },
  { path: '/manage', component: <Manage /> },
  { path: '/manage/:tab', component: <Manage /> },
  { path: '/sequencing', component: <Sequencing /> },
  { path: '/report_approval', component: <ReportApprovalSetting /> },
  { path: '/ai_scoring_approval', component: <AIScoringApprovalSetting /> },
]

export default routes
