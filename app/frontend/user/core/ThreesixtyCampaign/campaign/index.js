import { merge, setIn } from 'utils/immutable'

const FETCH = 'threeSixty/campaign/FETCH'
const DECLINE_EVALUATION = 'threeSixty/campaign/DECLINE_EVALUATION'

export const fetchCampaign = campaignId => ({
  type: FETCH,
  request: {
    url: `/campaigns/${campaignId}.json`,
  },
})

export const declineEvaluation = (campaignId, evaluationId) => ({
  type: DECLINE_EVALUATION,
  request: {
    url: `/campaigns/${campaignId}/evaluations/${evaluationId}/update_status`,
    method: 'put',
    body: { status: 'denied' },
  },
})

export const defaultState = {
  nominations: [],
  evaluations: [],
  reports: [],
  options: {
    participants: {
      manager: {},
      subject: {},
      evaluator: {},
    },
  },
}

const HANDLERS = {
  [FETCH]: (state, action) => merge(state, action.response),
  [DECLINE_EVALUATION]: (state, {response}) => {
    const index = _.findIndex(state.evaluations, {id: response.id})
    return setIn(state, ['evaluations', index, 'evaluatorStatus'], response.evaluatorStatus)
  }
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
