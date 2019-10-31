export const EDIT = 'threeSixty/user/EDIT'
export const UPDATE_FIELD = 'threeSixty/user/UPDATE_FIELD'
export const SAVE = 'threeSixty/user/SAVE'

export const edit = user => ({
  type: EDIT,
  payload: {
    user,
  },
})

export const update = (field, value) => ({
  type: UPDATE_FIELD,
  payload: {
    field, value,
  },
})

export const save = (campaignId, user) => ({
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

const defaultState = { userUnderEdit: { } }

const HANDLERS = {
  [EDIT]: (state, { payload: { user } }) => ({ ...state, userUnderEdit: { ...user } }),
  [UPDATE_FIELD]: (state, { payload: { field, value } }) => (
    { ...state, userUnderEdit: { ...state.userUnderEdit, [field]: value } }),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
