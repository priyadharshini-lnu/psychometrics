import MeetRoutes from '~/modules/admin/modules/Meet/routes'
import { DashboardFullScreenRoutes } from '~/modules/admin/modules/Dashboard/routes'

// Pages that own the whole viewport. Mounted beside the shell route, never under it, so they
// carry no sider and no top bar; their paths are absolute because nothing nests them.
const fullScreenRoutes = [
  ...MeetRoutes,
  ...DashboardFullScreenRoutes,
]

export default fullScreenRoutes
