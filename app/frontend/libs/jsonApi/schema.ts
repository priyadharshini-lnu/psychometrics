import { Schema as clientSchema } from 'modules/admin/modules/client/core/clients'
import { Schema as dashboardSchema } from 'modules/admin/modules/campaigns/core/dashboard'

export const Schema = {
  clients: clientSchema,
  dashboards: dashboardSchema,
}
