const FETCH = 'threeSixty/evaluation/FETCH'

export const fetchEvaluation = (campaignId, evaluationId) => ({
  type: FETCH,
  request: {
    url: `/campaigns/${campaignId}/evaluations/${evaluationId}`,
  },
})

export const defaultState = {
  subject: {},
  dataSheet: {},
  loaded: false,
}

const HANDLERS = {
  [FETCH]: (state, action) => ({ ...action.response, loaded: true }),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
