import * as t from 'io-ts'

export const DashboardTR = t.type({
  id: t.string,
  name: t.string,
  datasetId: t.union([t.string, t.null]),
  reportId: t.union([t.string, t.null]),
  enabled: t.boolean,
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
