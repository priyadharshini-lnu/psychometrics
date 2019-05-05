const FETCH_EVALUATION = 'threeSixty/managers/FETCH_EVALUATION'

export const fetchEvaluation = (campaignId, evaluationId) => ({
  type: FETCH_EVALUATION,
  request: {
    url: `/campaigns/${campaignId}/evaluations/${evaluationId}`,
  },
})

export const defaultState = {
  subject: {
    user: {
      firstName: 'Mocked',
      lastName: 'User',
    }
  },
  results: null
}

const HANDLERS = {
  [FETCH_EVALUATION]: (state, action) => ({...state, results: action.response})
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
