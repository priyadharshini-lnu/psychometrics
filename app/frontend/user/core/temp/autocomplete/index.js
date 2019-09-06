const SEARCH_EVALUATORS = 'temp/users/SEARCH_EVALUATORS'
export const defaultState = {
  users: [],
}

export const searchEvaluators = (campaignId, nominationId, q) => ({
  type: SEARCH_EVALUATORS,
  request: {
    method: 'post',
    url: `/campaigns/${campaignId}/nominations/${nominationId}/search_evaluators`,
    body: {
      q,
    },
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case SEARCH_EVALUATORS:
      return { ...state, users: action.response }
    default:
      return state
  }
}
