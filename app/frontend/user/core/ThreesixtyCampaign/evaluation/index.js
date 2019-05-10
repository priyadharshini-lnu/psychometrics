const FETCH = 'threeSixty/evaluation/FETCH'

export const fetchEvaluation = (campaignId, evaluationId) => ({
  type: FETCH,
  request: {
    url: `/campaigns/${campaignId}/evaluations/${evaluationId}`,
  },
})

export const defaultState = {
  subject: {
    user: {
      firstName: 'Mocked',
      lastName: 'User',
    },
  },
  results: null,
}

const HANDLERS = {
  [FETCH]: (state, action) => ({ ...state, results: action.response }),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
