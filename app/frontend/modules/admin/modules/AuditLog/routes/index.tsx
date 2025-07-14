import { lazy } from 'react'

const AuditLogList = lazy(() => import('./AuditLogList'))
const AuditLogInfo = lazy(() => import('./AuditLogInfo'))

const routes = [
  {
    path: 'audit_logs',
    element: <AuditLogList />,
  },
  {
    path: 'audit_logs/:id',
    element: <AuditLogInfo />,
  },
]

export default routes
