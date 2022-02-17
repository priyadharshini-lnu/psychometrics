import AuditLogList from './AuditLogList'
import AuditLogInfo from './AuditLogInfo'

const routes = [
  {
    path: '/',
    component: AuditLogList,
  },
  {
    path: '/:id',
    component: AuditLogInfo,
  },
]

export default routes
