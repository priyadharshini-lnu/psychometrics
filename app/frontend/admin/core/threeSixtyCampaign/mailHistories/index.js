import _ from 'lodash'
import { updateIn } from 'utils/immutable'

export const get = state => _.get(state, ['threeSixtyCampaign', 'mailHistories'])

const defaultState = {
  list: [],
  total: 0,
}

export const FETCH = 'threeSixty/mailHistories/FETCH'

export const update = (id, key, value) => ({ type: UPDATE, payload: { id, key, value } })

export const fetch = (campaignId, page) => ({
  type: FETCH,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/mail_histories`,
    body: { page }
  },
})


const HANDLERS = {
  [FETCH]: (state, { response: { mailHistories, total } }) => ({ ...state, list: mailHistories, total }),
}

export default function reducer(state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
