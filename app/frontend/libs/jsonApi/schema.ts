import { Schema as clientSchema } from 'modules/admin/modules/client/core/clients'
import { Schema as dashboardSchema } from 'modules/admin/modules/campaigns/core/dashboard'
import { CommentSchema as commentSchema } from 'modules/admin/modules/campaigns/core/userReports'
import { Schema as reportApprovalSettingSchema } from 'modules/admin/modules/campaigns/core/reportApprovalSettings'

export const Schema = {
  clients: clientSchema,
  dashboards: dashboardSchema,
  user_report_comments: commentSchema,
  report_approval_settings: reportApprovalSettingSchema,
}
