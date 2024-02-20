import UserRoutes from '~/modules/admin/modules/Users/routes'
import { routes as ClientRoutes } from '~/modules/admin/modules/client/routes'
import ProfileRoutes from '~/modules/admin/modules/Profile/routes'
import MeetRoutes from '~/modules/admin/modules/Meet/routes'
import ReportRoutes from '~/modules/admin/modules/Reports/routes'
import UserAvailabilityRoutes from '~/modules/admin/modules/UserAvailability/routes'

const routes = [
  ...ProfileRoutes,
  ...MeetRoutes,
  ...ClientRoutes,
  ...UserRoutes,
  ...ReportRoutes,
  ...UserAvailabilityRoutes,
]

export default routes
