
import _ from 'lodash'

export const SET_ID = 'threeSixty/campaign/SET_ID'

export const getId = state => _.get(state, ['threeSixtyCampaign', 'id'])

export const setId = id => ({
  type: SET_ID,
  payload: { id },
})

export default function reducer (state = null, { type, payload }) {
  switch (type) {
    case SET_ID:
      return payload.id
    default:
      return state
  }
}
