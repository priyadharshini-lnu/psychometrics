import ApiAction from 'interfaces/ApiAction'
import { createReducer } from '~/utils/redux'

export const Schema = {
  type: 'workshop_invited_subjects',
  relationships: {
    user: {
      type: 'users',
    },
  },
}

export const IMPORT_CSV = 'resource/workshop_invited_subjects/IMPORT_CSV'

interface User {
  id: string
  type: string
}

interface ImportError {
  index: number
  email: string | null
  workshopInviteName?: string
  error_type: 'user_not_in_campaign' | 'assessment_group_conflict' | 'empty_csv'
}

type UsersResponse = ApiAction<{
  data: User[]
  meta: {
    errors?: ImportError[]
    jobQueued?: boolean
  }
}>

export const importCSV = (campaignId: string, inviteId: string, data: FormData): UsersResponse => ({
  type: IMPORT_CSV,
  request: {
    method: 'post',
    url: `/api/v2/administration/campaigns/${campaignId}/workshop_invites/${inviteId}/workshop_invited_subjects/`
      + 'import_subjects_from_csv',
    body: data,
    contentType: 'multipart/form-data;' as const,
  },
})

export const reducer = createReducer({}, null)
