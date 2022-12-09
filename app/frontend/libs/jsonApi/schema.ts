import { Schema as clientSchema } from 'modules/admin/modules/client/core/clients'
import { Schema as dashboardSchema } from 'modules/admin/modules/campaigns/core/dashboard'
import { Schema as reportApprovalSettingSchema } from 'modules/admin/modules/campaigns/core/reportApprovalSettings'

export const Schema = {
  clients: clientSchema,
  dashboards: dashboardSchema,
  report_approval_settings: reportApprovalSettingSchema,
}
