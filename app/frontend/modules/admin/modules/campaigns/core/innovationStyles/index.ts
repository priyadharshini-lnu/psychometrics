import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'

export const InnovationStylesTR = t.type({
  id: t.string,
  name: t.string,
  iconUrl: t.union([t.string, t.null, t.undefined]),
  position: t.union([t.number, t.null, t.undefined]),
  createdAt: t.union([t.string, t.undefined]),
  updatedAt: t.union([t.string, t.undefined]),
})

export type InnovationStyles = t.TypeOf<typeof InnovationStylesTR>

export const Schema = {
  type: 'innovation_styles',
  relationships: {
    dimension: {
      type: 'dimensions',
    },
  },
}

export const UPLOAD_FILES = 'resource/innovation_styles/UPLOAD_FILES'

export const uploadFiles = (dimensionId: string, id: string, data: FormData): ApiAction<void> => ({
  type: UPLOAD_FILES,
  request: {
    method: 'put',
    contentType: 'multipart/form-data;',
    url: `/api/v2/administration/dimensions/${dimensionId}/innovation_styles/${id}/uploads`,
    body: data,
  },
})
