import { lazy } from 'react'

const AuditLogList = lazy(() => import('./AuditLogList'))
const AuditLogInfo = lazy(() => import('./AuditLogInfo'))
const RecordHistory = lazy(() => import('./RecordHistory'))

const routes = [
  {
    path: 'audit_logs',
    element: <AuditLogList />,
  },
  {
    path: 'audit_logs/record_trace',
    element: <RecordHistory />,
  },
  {
    path: 'audit_logs/:id',
    element: <AuditLogInfo />,
  },
]

export default routes
