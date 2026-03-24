import * as t from 'io-ts'
import ApiAction from 'interfaces/ApiAction'

export const OccupationTR = t.type({
  id: t.string,
  name: t.string,
  iconUrl: t.union([t.string, t.null, t.undefined]),
  alternativeIconUrl: t.union([t.string, t.null, t.undefined]),
  indicativeRolesImageUrl: t.union([t.string, t.null, t.undefined]),
  keyCareerTracksImageUrl: t.union([t.string, t.null, t.undefined]),
  createdAt: t.union([t.string, t.undefined]),
  updatedAt: t.union([t.string, t.undefined]),
})

export type Occupation = t.TypeOf<typeof OccupationTR>

export const Schema = {
  type: 'occupations',
  relationships: {
    dimension: {
      type: 'dimensions',
    },
  },
}

export const UPLOAD_FILES = 'resource/occupations/UPLOAD_FILES'

export const uploadFiles = (dimensionId: string, id: string, data: FormData): ApiAction<void> => ({
  type: UPLOAD_FILES,
  request: {
    method: 'put',
    contentType: 'multipart/form-data;',
    url: `/api/v2/administration/dimensions/${dimensionId}/occupations/${id}/uploads`,
    body: data,
  },
})
