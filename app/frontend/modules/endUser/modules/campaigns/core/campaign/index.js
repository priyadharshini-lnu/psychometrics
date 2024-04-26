import _ from 'lodash'
import humps from 'humps'
import { setIn } from '~/utils/immutable'

const BEGIN = 'campaign/BEGIN'
const FETCH = 'campaign/FETCH'
export const FETCH_INSIGHTS = 'campaign/FETCH_INSIGHTS'
const FETCH_OPTIONS = 'campaign/FETCH_OPTIONS'
const CONTINUE = 'campaign/CONTINUE'
const DECLINE_EVALUATION = 'campaign/DECLINE_EVALUATION'
const RESET = 'campaign/RESET_DATA'
const RESET_PRACTICE_CAMPAIGN = 'campaign/RESET_PRACTICE_CAMPAIGN'

export const fetchCampaign = url => ({
  type: FETCH,
  request: {
    url,
  },
})

export const fetchInsights = url => ({
  type: FETCH_INSIGHTS,
  request: {
    url,
    camelize: false,
    loader: true,
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

export const resetPracticeCampaign = campaignId => ({
  type: RESET_PRACTICE_CAMPAIGN,
  request: {
    url: `/campaigns/${campaignId}/reset_practice_campaign`,
    method: 'put',
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

export const getReports = state => _.get(state, ['campaigns', 'campaign', 'userReports'])
export const getUserDashboard = state => _.get(state, ['campaigns', 'campaign', 'userDashboard'])

const HANDLERS = {
  [FETCH]: (state, action) => ({ ...state, ...action.response, loaded: true }),
  [FETCH_INSIGHTS]: (state, action) => ({
    ...state,
    userDashboard: action.response.user_dashboard,
    userReports: humps.camelizeKeys(action.response.user_reports),
  }),
  [FETCH_OPTIONS]: (state, { response }) => setIn(state, 'options', response),
  [BEGIN]: (state, { response }) => {
    if (response.examusSessionUrl) return state
    return setIn(state, 'campaignUser', response)
  },
  [CONTINUE]: (state, { response }) => {
    if (response.examusSessionUrl) return state
    return setIn(state, 'campaignUser', response)
  },
  [RESET]: () => defaultState,
  [DECLINE_EVALUATION]: (state, { requestAction: { evaluationId } }) => {
    const evaluations = _.filter(state.evaluations, ({ id }) => id !== evaluationId)
    return setIn(state, 'evaluations', evaluations)
  },
  [RESET_PRACTICE_CAMPAIGN]: (state, action) => ({ ...state, ...action.response, loaded: true }),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
