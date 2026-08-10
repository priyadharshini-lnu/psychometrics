import { lazyPages } from '~/utils/lazyPages'

const page = lazyPages('auditLog', () => import('../pages'))

const AuditLogList = page(m => m.AuditLogList)
const AuditLogInfo = page(m => m.AuditLogInfo)
const RecordHistory = page(m => m.RecordHistory)

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
