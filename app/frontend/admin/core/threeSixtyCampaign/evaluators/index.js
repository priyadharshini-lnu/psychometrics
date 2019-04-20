const FETCH_EVALUATORS = 'threeSixty/subjects/FETCH_EVALUATORS'
export const defaultState = []

export const fetchEvaluators = campaignId => ({
  type: FETCH_EVALUATORS,
  request: {
    url: `/administration/threesixty_campaigns/${campaignId}/participants`,
  },
})

export default function reducer (state = defaultState, action) {
  switch (action.type) {
    case FETCH_EVALUATORS:
      return action.data
    default:
      return state
  }
}
