import { lazy } from 'react'

const AuditLogList = lazy(() => import('./AuditLogList'))
const AuditLogInfo = lazy(() => import('./AuditLogInfo'))

const routes = [
  { redirect: true, from: '/', to: '/audit_logs' },
  {
    path: '/audit_logs',
    component: AuditLogList,
  },
  {
    path: '/audit_logs/:id',
    component: AuditLogInfo,
  },
]

export default routes
