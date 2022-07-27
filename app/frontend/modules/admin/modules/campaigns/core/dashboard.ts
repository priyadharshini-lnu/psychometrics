import * as t from 'io-ts'
import { createBaseAtom } from 'hooks/useResources/utils'

export const DashboardTR = t.type({
  id: t.string,
  name: t.string,
  datasetId: t.union([t.string, t.null]),
  reportId: t.union([t.string, t.null]),
  enabled: t.boolean,
  embedToken: t.union([t.string, t.undefined, t.null]),
  imageUrl: t.union([t.string, t.undefined, t.null]),
  imageName: t.union([t.string, t.undefined, t.null]),
  refresh_interval: t.union([t.number, t.undefined]),
  campaign: t.union([
    t.type({
      id: t.string,
      name: t.union([t.string, t.undefined]),
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

export const UPLOAD_IMAGE = 'dashboards/UPLOAD_IMAGE'

export const uploadImage = (dashboardId: string, formData: FormData) => ({
  type: UPLOAD_IMAGE,
  request: {
    method: 'patch',
    url: `/api/v2/administration/dashboards/${dashboardId}/upload_image`,
    body: formData,
    loader: true,
  },
})
