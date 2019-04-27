const FETCH_EVALUATORS = 'threeSixty/subjects/FETCH_EVALUATORS'
export const defaultState = {
  list: [],
  form: {
    attrs: {},
    errors: {},
  },
}

export const fetchEvaluators = campaignId => ({
  type: FETCH_EVALUATORS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/evaluators`,
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_EVALUATORS:
      return { ...state, list: action.response }
    default:
      return state
  }
}
