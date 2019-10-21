export const UPDATE_FIELD = 'threeSixty/user/UPDATE_FIELD'
export const SAVE = 'threeSixty/user/SAVE'

export const update = (userId, field, value) => ({
  type: UPDATE_FIELD,
  payload: {
    userId, field, value,
  },
})

export const save = (campaignId, user) => ({
  type: SAVE,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/users/${user.id}`,
    body: {
      user,
    },
  },
})

const defaultState = {}

const HANDLERS = {
  [UPDATE_FIELD]: (state, { payload: { field, value } }) => ({ ...state, [field]: value }),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
