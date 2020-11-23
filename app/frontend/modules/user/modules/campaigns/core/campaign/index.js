import { setIn } from 'utils/immutable'
import _ from 'lodash'

const BEGIN = 'campaign/BEGIN'
const FETCH = 'campaign/FETCH'
const FETCH_OPTIONS = 'campaign/FETCH_OPTIONS'
const CONTINUE = 'campaign/CONTINUE'
const DECLINE_EVALUATION = 'campaign/DECLINE_EVALUATION'
const RESET = 'campaign/RESET_DATA'

export const fetchCampaign = url => ({
  type: FETCH,
  request: {
    url: `${url}.json`,
  },
})
export const fetchCampaignOptions = campaignId => ({
  type: FETCH_OPTIONS,
  request: {
    url: `/threesixty_campaigns/${campaignId}/options`,
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

export const continueCampaign = campaignUserId => ({
  type: CONTINUE,
  request: {
    url: `/campaign_users/${campaignUserId}/continue_campaign`,
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
  [FETCH_OPTIONS]: (state, { response }) => setIn(state, 'options', response),
  [BEGIN]: (state, { response }) => (setIn(state, 'campaignUser', response)),
  [CONTINUE]: (state, { response }) => (setIn(state, 'campaignUser', response)),
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
