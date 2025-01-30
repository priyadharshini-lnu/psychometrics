import UserRoutes from '~/modules/admin/modules/Users/routes'
import ClientRoutes from '~/modules/admin/modules/client/routes'
import ProfileRoutes from '~/modules/admin/modules/Profile/routes'
import MeetRoutes from '~/modules/admin/modules/Meet/routes'
import ReportRoutes from '~/modules/admin/modules/Reports/routes'
import UserAvailabilityRoutes from '~/modules/admin/modules/UserAvailability/routes'
import AuditLogRoutes from '~/modules/admin/modules/AuditLog/routes'
import AssessmentRoutes from '~/modules/admin/modules/Assessments/routes'
import ReportApprovalsRoutes from '~/modules/admin/modules/ReportApprovals/routes'
import CampaignRoutes from '~/modules/admin/modules/CampaignTemplates/routes'
import DashboardRoutes from '~/modules/admin/modules/Dashboard/routes'
import NormsRoutes from '~/modules/admin/modules/Norms/routes'
import Skills from '~/modules/admin/modules/Skills/routes'

const routes = [
  ...ProfileRoutes,
  ...MeetRoutes,
  ...ClientRoutes,
  ...UserRoutes,
  ...ReportRoutes,
  ...ReportApprovalsRoutes,
  ...UserAvailabilityRoutes,
  ...AuditLogRoutes,
  ...AssessmentRoutes,
  ...CampaignRoutes,
  ...DashboardRoutes,
  ...NormsRoutes,
  ...Skills,
]

export default routes
