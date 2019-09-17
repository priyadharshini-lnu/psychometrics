import _ from 'lodash'
import { updateIn } from 'utils/immutable'

export const get = state => _.get(state, ['threeSixtyCampaign', 'mailHistories'])

const defaultState = {
  list: [],
}

export const FETCH = 'threeSixty/mailHistories/FETCH'

export const update = (id, key, value) => ({ type: UPDATE, payload: { id, key, value } })

export const fetch = campaignId => ({
  type: FETCH,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/mail_histories`,
  },
})


const HANDLERS = {
  [FETCH]: (state, { response }) => ({ ...state, list: response }),
}

export default function reducer(state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
