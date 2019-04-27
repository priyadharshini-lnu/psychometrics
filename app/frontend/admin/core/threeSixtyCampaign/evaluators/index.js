import { setIn } from 'utils/immutable'

export const CLEAR_FORM = 'threeSixty/evaluators/CLEAR_FORM'
export const CREATE_ALL_EVALUATORS = 'threeSixty/evaluators/CREATE_ALL_EVALUATORS'
export const CREATE_ALL_EVALUATORS_FAILURE = 'threeSixty/evaluators/CREATE_ALL_EVALUATORS_FAILURE'
const FILL_EVALUATORS = 'threeSixty/evaluators/FILL_EVALUATORS'
const FETCH_EVALUATORS = 'threeSixty/evaluators/FETCH_EVALUATORS'

export const defaultState = {
  list: [],
  form: {
    attrs: {},
    errors: null,
  },
}
export const createAllEvaluators = (campaignId, evaluators) => ({
  type: CREATE_ALL_EVALUATORS,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/evaluators/create_all`,
    body: { evaluators },
  },
})

export const fillEvaluators = evaluators => ({ type: FILL_EVALUATORS, evaluators })
export const clearForm = () => ({ type: CLEAR_FORM })

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
    case FILL_EVALUATORS:
      return setIn(state, ['form', 'attrs'], action.evaluators)
    case CLEAR_FORM:
      return { ...state, form: defaultState.form }
    case CREATE_ALL_EVALUATORS_FAILURE:
      return setIn(state, ['form', 'errors'], action.errors)
    default:
      return state
  }
}
