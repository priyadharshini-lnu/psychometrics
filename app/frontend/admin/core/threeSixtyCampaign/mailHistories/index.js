import _ from 'lodash'
import { updateIn } from 'utils/immutable'

export const get = state => _.get(state, ['threeSixtyCampaign', 'mailHistories'])

const defaultState = {
  list: [],
  total: 0,
}

export const FETCH = 'threeSixty/mailHistories/FETCH'
export const REMOVE = 'threeSixty/mailHistories/REMOVE'

export const remove = (campaignId, emailScheduleId) => ({
  type: REMOVE,
  emailScheduleId,
  request: {
    method: 'delete',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/${emailScheduleId}`,
  },
})

export const fetch = (campaignId, page) => ({
  type: FETCH,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules`,
    body: { page },
  },
})


const HANDLERS = {
  [FETCH]: (state, { response: { emailSchedules, total } }) => ({ ...state, list: emailSchedules, total }),
  [REMOVE]: (state, { requestAction: { emailScheduleId } }) => (
    updateIn(state, 'list', emailSchedules => _.filter(emailSchedules, ({ id }) => id !== emailScheduleId))
  ),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
