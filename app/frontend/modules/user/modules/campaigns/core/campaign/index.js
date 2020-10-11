import { setIn } from 'utils/immutable'
import _ from 'lodash'

const BEGIN = 'campaign/BEGIN'
const FETCH = 'campaign/FETCH'
const DECLINE_EVALUATION = 'campaign/DECLINE_EVALUATION'
const RESET = 'campaign/RESET_DATA'

export const fetchCampaign = url => ({
  type: FETCH,
  request: {
    url: `${url}.json`,
  },
})

export const declineEvaluation = (campaignId, evaluationId) => ({
  type: DECLINE_EVALUATION,
  evaluationId,
  request: {
    url: `/threesixty_campaigns/${campaignId}/evaluations/${evaluationId}/decline`,
    method: 'put',
  },
})

export const beginCampaign = campaignUserId => ({
  type: BEGIN,
  request: {
    url: `/campaign_users/${campaignUserId}/begin_campaign`,
    method: 'post',
  },
})

export const reset = () => ({ type: RESET })

export const defaultState = {
  loaded: false,
  nominations: [],
  evaluations: [],
  evaluationsCounters: {},
  nominationsCounters: {},
  reportsCounters: {},
  managedSubjects: [],
  reports: [],
  instructions: [],
  options: {
    participants: {
      manager: {},
      subject: {},
      evaluator: {},
      global: {},
    },
    reports: { approval: {} },
  },
}

const HANDLERS = {
  [FETCH]: (state, action) => ({ ...state, ...action.response, loaded: true }),
  [BEGIN]: (state, { response }) => (setIn(state, 'campaignUser', response)),
  [RESET]: () => defaultState,
  [DECLINE_EVALUATION]: (state, { requestAction: { evaluationId } }) => {
    const evaluations = _.filter(state.evaluations, ({ id }) => id !== evaluationId)
    return setIn(state, 'evaluations', evaluations)
  },
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
