import _ from 'lodash'
import { updateIn, setIn } from 'utils/immutable'
import { without } from 'lodash/fp'

const FETCH = 'threeSixty/nomination/FETCH'
const REMOVE = 'threeSixty/nomination/REMOVE'
const ADD = 'threeSixty/nomination/ADD'
const ADD_FAILURE = 'threeSixty/nomination/ADD_FAILURE'
const UPDATE_FORM = 'threeSixty/nomination/UPDATE_FORM'

export const fetchNomination = ({ campaignId, id }) => ({
  type: FETCH,
  request: {
    url: `/campaigns/${campaignId}/nominations/${id}`,
  },
})

export const removeNomination = ({ campaignId, nominationId, evaluator }) => ({
  type: REMOVE,
  evaluator,
  request: {
    url: `/campaigns/${campaignId}/nominations/${nominationId}/evaluators/${evaluator.evaluator.id}`,
    method: 'delete',
  },
})

export const addNomination = ({
  campaignId, nominationId, relationshipId, userId,
}) => ({
  type: ADD,
  request: {
    url: `/campaigns/${campaignId}/nominations/${nominationId}/evaluators`,
    method: 'post',
    body: {
      relationship_id: relationshipId,
      evaluator_id: userId,
    },
  },
})

export const updateForm = form => ({ type: UPDATE_FORM, form })

const HANDLERS = {
  [FETCH]: (state, action) => {
    const evaluators = _.groupBy(action.response.evaluators, 'relationship.name')

    return {
      ...state, ...action.response, evaluators,
    }
  },
  [ADD]: (state, action) => {
    const { relationship } = action.response
    const newStore = updateIn(state, ['evaluators', relationship.name], (list = []) => list.concat(action.response))
    return setIn(newStore, ['form'], { attrs: {}, errors: {} })
  },
  [ADD_FAILURE]: (state, action) => setIn(state, ['form', 'errors'], action.errors),
  [REMOVE]: (state, action) => {
    const { id, relationship } = action.requestAction.evaluator
    return setIn(state, ['evaluators', relationship.name], without(state.evaluators[relationship.name], { id }))
  },
  [UPDATE_FORM]: (state, action) => setIn(state, ['form', 'attrs'], action.form),
}

const defaultState = {
  subject: {},
  requirements: {},
  evaluators: [],
  relationships: [],
  form: {
    attrs: {},
    errors: {},
  },
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
