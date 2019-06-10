import _ from 'lodash'
import { updateIn, setIn, getIn } from 'utils/immutable'

const FETCH = 'threeSixty/nomination/FETCH'
const REMOVE = 'threeSixty/nomination/REMOVE'
const ADD = 'threeSixty/nomination/ADD'
const ADD_FAILURE = 'threeSixty/nomination/ADD_FAILURE'
const SHOW_FORM = 'threeSixty/nomination/SHOW_FORM'
const HIDE_FORM = 'threeSixty/nomination/HIDE_FORM'
const UPDATE_FORM = 'threeSixty/nomination/UPDATE_FORM'
const UPDATE_STATUS = 'threeSixty/nomination/UPDATE_STATUS'

export const fetchNomination = ({ campaignId, id }) => ({
  type: FETCH,
  request: {
    url: `/campaigns/${campaignId}/nominations/${id}`,
  },
})

export const showForm = () => ({ type: SHOW_FORM })
export const hideForm = () => ({ type: HIDE_FORM })

export const removeNomination = ({ campaignId, nominationId, evaluator }) => ({
  type: REMOVE,
  evaluator,
  request: {
    url: `/campaigns/${campaignId}/nominations/${nominationId}/evaluators/${evaluator.evaluator.id}`,
    method: 'delete',
  },
})

export const addNomination = ({
  campaignId, nominationId, relationshipId, userId: evaluatorId,
}) => ({
  type: ADD,
  request: {
    url: `/campaigns/${campaignId}/nominations/${nominationId}/evaluators`,
    method: 'post',
    body: {
      relationshipId,
      evaluatorId,
    },
  },
})

export const updateStatus = ({
  campaignId, nominationId, evaluatorId, status,
}) => ({
  type: UPDATE_STATUS,
  request: {
    url: `/campaigns/${campaignId}/nominations/${nominationId}/evaluators/${evaluatorId}/update_status`,
    method: 'put',
    body: {
      status,
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
    return setIn(state, ['evaluators', relationship.name],
      _.filter(state.evaluators[relationship.name], e => e.id !== id))
  },
  [UPDATE_FORM]: (state, action) => setIn(state, ['form', 'attrs'], action.form),
  [UPDATE_STATUS]: (state, action) => {
    const { id, relationship } = action.response
    const evaluators = getIn(state, ['evaluators', relationship.name])
    return setIn(state, ['evaluators', relationship.name, _.findIndex(evaluators, { id })], action.response)
  },
  [SHOW_FORM]: state => setIn(state, ['form', 'show'], true),
  [HIDE_FORM]: state => setIn(state, ['form', 'show'], false),

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
