import { Schema as clientSchema } from '~/modules/admin/modules/client/core/clients'
import { Schema as assessmentSchema } from '~/modules/admin/modules/client/core/assessments'
import { Schema as dashboardSchema } from '~/modules/admin/modules/campaigns/core/dashboard'
import { Schema as reportApprovalSchema } from '~/modules/admin/modules/ReportApprovals/core'
import { CommentSchema as commentSchema } from '~/modules/admin/modules/campaigns/core/userReports'
import { Schema as reportApprovalSettingSchema } from '~/modules/admin/modules/campaigns/core/reportApprovalSettings'
import { Schema as licensesSchema } from '~/modules/admin/modules/client/core/licenses'
import { Schema as licenseUsagesSchema } from '~/modules/admin/modules/client/core/license_usages'

export const Schema = {
  clients: clientSchema,
  assessments: assessmentSchema,
  dashboards: dashboardSchema,
  report_approvals: reportApprovalSchema,
  user_report_comments: commentSchema,
  report_approval_settings: reportApprovalSettingSchema,
  licenses: licensesSchema,
  license_usages: licenseUsagesSchema,
}
