import ApiAction from 'interfaces/ApiAction'
import { createReducer } from '~/utils/redux'

export const Schema = {
  type: 'workshop_invites',
  relationships: {
    workshops: {
      type: 'workshops',
    },
  },
}

export const UPLOAD_CSV = 'resource/workshop_invites/UPLOAD_CSV'

interface User {
  id: string,
  attributes: {}
}

type UsersResponse = ApiAction<{data: User[], meta: {errors?:[]}}>

export const uploadCSV = (campaignId:string, data: FormData): UsersResponse => ({
  type: UPLOAD_CSV,
  request: {
    method: 'post',
    url: `/api/v2/administration/campaigns/${campaignId}/workshop_invites/import_subjects_from_csv`,
    body: data,
    contentType: 'multipart/form-data;' as const,
  },
})

export const reducer = createReducer({}, null)
