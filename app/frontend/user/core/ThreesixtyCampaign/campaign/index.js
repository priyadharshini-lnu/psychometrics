import { setIn } from 'utils/immutable'
import _ from 'lodash'

const FETCH = 'threeSixty/campaign/FETCH'
const DECLINE_EVALUATION = 'threeSixty/campaign/DECLINE_EVALUATION'
const RESET = 'threeSixty/campaign/RESET_DATA'

export const fetchCampaign = campaignId => ({
  type: FETCH,
  request: {
    url: `/campaigns/${campaignId}.json`,
  },
})

export const declineEvaluation = (campaignId, evaluationId) => ({
  type: DECLINE_EVALUATION,
  evaluationId,
  request: {
    url: `/campaigns/${campaignId}/evaluations/${evaluationId}/decline`,
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
    },
  },
}

const HANDLERS = {
  [FETCH]: (state, action) => ({ ...state, ...action.response, loaded: true }),
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
