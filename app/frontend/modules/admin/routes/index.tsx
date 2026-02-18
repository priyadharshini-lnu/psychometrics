import UserRoutes from '~/modules/admin/modules/Users/routes'
import ClientRoutes from '~/modules/admin/modules/client/routes'
import ProfileRoutes from '~/modules/admin/modules/Profile/routes'
import MeetRoutes from '~/modules/admin/modules/Meet/routes'
import ReportRoutes from '~/modules/admin/modules/Reports/routes'
import UserAvailabilityRoutes from '~/modules/admin/modules/UserAvailability/routes'
import { DataReportsRoutes } from '~/modules/admin/modules/DataReports/routes'
import AuditLogRoutes from '~/modules/admin/modules/AuditLog/routes'
import AssessmentRoutes from '~/modules/admin/modules/Assessments/routes'
import ReportApprovalsRoutes from '~/modules/admin/modules/ReportApprovals/routes'
import ScoreApprovalsRoutes from '~/modules/admin/modules/ScoreApprovals/routes'
import CampaignRoutes from '~/modules/admin/modules/CampaignTemplates/routes'
import DashboardRoutes from '~/modules/admin/modules/Dashboard/routes'
import NormsRoutes from '~/modules/admin/modules/Norms/routes'
import Skills from '~/modules/admin/modules/SkillsTaxonomy/routes'
import DevelopmentActionRoutes from '~/modules/admin/modules/DevelopmentActions/routes'
import AiAssitantRoutes from '~/modules/admin/modules/AiAssitant/routes'

const routes = [
  ...ProfileRoutes,
  ...MeetRoutes,
  ...ClientRoutes,
  ...UserRoutes,
  ...ReportRoutes,
  ...ReportApprovalsRoutes,
  ...ScoreApprovalsRoutes,
  ...UserAvailabilityRoutes,
  ...DataReportsRoutes,
  ...AuditLogRoutes,
  ...AssessmentRoutes,
  ...CampaignRoutes,
  ...DashboardRoutes,
  ...NormsRoutes,
  ...Skills,
  ...DevelopmentActionRoutes,
  ...AiAssitantRoutes,
]

export default routes
