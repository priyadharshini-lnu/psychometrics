import * as t from 'io-ts'
import { createBaseAtom } from 'hooks/useResources/utils'

export const DashboardTR = t.type({
  id: t.string,
  name: t.string,
  datasetId: t.union([t.string, t.null]),
  reportId: t.union([t.string, t.null]),
  enabled: t.boolean,
  embedToken: t.union([t.string, t.undefined, t.null]),
  campaign: t.union([
    t.type({
      id: t.string,
    }),
    t.undefined]),
})

export type Dashboard = t.TypeOf<typeof DashboardTR>

export const Schema = {
  type: 'dashboards',
  relationships: {
    campaign: {
      type: 'campaigns',
    },
  },
}

export const dashboardAtom = createBaseAtom<Dashboard[]>('Dashboard')
