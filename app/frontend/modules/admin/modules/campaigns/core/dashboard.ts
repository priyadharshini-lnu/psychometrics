import * as t from 'io-ts'
import { createZutandStoreForJsonApi } from '~/hooks/useResources/utils'

export const DashboardTR = t.type({
  id: t.string,
  name: t.string,
  datasetId: t.union([t.string, t.null]),
  reportId: t.union([t.string, t.null]),
  enabled: t.boolean,
  embedToken: t.union([t.string, t.undefined, t.null]),
  imageUrl: t.union([t.string, t.undefined, t.null]),
  imageName: t.union([t.string, t.undefined, t.null]),
  refreshInterval: t.union([t.number, t.undefined, t.null]),
  capacityId: t.union([t.undefined, t.null, t.string]),
  workspaceId: t.union([t.undefined, t.null, t.string]),
  dashboardType: t.string,
  projectPath: t.union([t.undefined, t.null, t.string]),
  visualHeaderVisibility: t.union([t.literal('hide_all'), t.literal('show_all'), t.literal('keep_original')]),
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

export const useDashboardStore = createZutandStoreForJsonApi<Dashboard[]>('dashboard')

export const UPLOAD_IMAGE = 'dashboards/UPLOAD_IMAGE'
export const uploadImage = (dashboardId: string, formData: FormData) => ({
  type: UPLOAD_IMAGE,
  request: {
    method: 'patch',
    url: `/api/v2/administration/dashboards/${dashboardId}/upload_image`,
    body: formData,
    loader: true,
    contentType: 'multipart/form-data;' as const,
  },
})

export const REFRESH = 'dashboards/REFRESH'
export const refresh = (dashboardId: string) => ({
  type: REFRESH,
  request: {
    method: 'post',
    url: `/api/v2/administration/dashboards/${dashboardId}/refresh`,
    loader: true,
  },
})
