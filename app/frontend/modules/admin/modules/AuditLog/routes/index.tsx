import { lazyRoute } from '~/utils/lazyRoute'

const page = () => import('../pages')

const routes = [
  {
    path: 'audit_logs',
    lazy: lazyRoute(page, m => m.AuditLogList),
  },
  {
    path: 'audit_logs/record_trace',
    lazy: lazyRoute(page, m => m.RecordHistory),
  },
  {
    path: 'audit_logs/:id',
    lazy: lazyRoute(page, m => m.AuditLogInfo),
  },
]

export default routes
