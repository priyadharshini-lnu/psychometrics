import _ from 'lodash'
import { createReducer } from '~/utils/redux'

export const EDIT = 'threeSixty/user/EDIT'
export const UPDATE_FIELD = 'threeSixty/user/UPDATE_FIELD'
export const SAVE = 'threeSixty/user/SAVE'

interface User {
  id: number
  firstName: string
  lastName: string
}

export const get = state => _.get(state, ['threeSixtyCampaign', 'users'])
export const getUserUnderEdit = state => _.get(get(state), ['userUnderEdit'])

export const edit = (user: User) => ({
  type: EDIT,
  payload: {
    user,
  },
})

export const update = (field: string, value: User) => ({
  type: UPDATE_FIELD,
  payload: {
    field, value,
  },
})

export const save = (campaignId: number, user: User) => ({
  type: SAVE,
  request: {
    method: 'put',
    loader: true,
    url: `/administration/threesixty_campaigns/${campaignId}/users/${user.id}`,
    body: {
      user,
    },
  },
})
export type EditAction = ReturnType<typeof edit>
export type UpdateAction = ReturnType<typeof update>

const defaultState = { userUnderEdit: { } }

const HANDLERS = {
  [EDIT]: (state, { payload: { user } }: EditAction) => ({ ...state, userUnderEdit: { ...user } }),
  [UPDATE_FIELD]: (state, { payload: { field, value } }: UpdateAction) => (
    { ...state, userUnderEdit: { ...state.userUnderEdit, [field]: value } }),
}

export default createReducer(HANDLERS, defaultState)
