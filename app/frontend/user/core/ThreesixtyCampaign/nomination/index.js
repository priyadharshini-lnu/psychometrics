import _ from 'lodash'
import { updateIn, setIn } from 'utils/immutable'
import { without } from 'lodash/fp'

const FETCH = 'threeSixty/nomination/FETCH'
const REMOVE = 'threeSixty/nomination/REMOVE'
const ADD = 'threeSixty/nomination/ADD'

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
    url: `/campaigns/${campaignId}/nominations/${nominationId}/evaluations/${evaluator.user.id}`,
    method: 'delete',
  },
})

export const addNomination = ({
  campaignId, nominationId, relationshipId, userId,
}) => ({
  type: ADD,
  request: {
    url: `/campaigns/${campaignId}/nominations/${nominationId}/evaluations`,
    method: 'post',
    body: {
      relationship_id: relationshipId,
      evaluator_id: userId,
    },
  },
})

const HANDLERS = {
  [FETCH]: (state, action) => {
    const evaluators = _.groupBy(action.response.evaluators, 'relationship.name')

    return {
      ...state, ...action.response, evaluators,
    }
  },
  [ADD]: (state, action) => {
    const { role } = action.response
    return updateIn(state, ['evaluators', role.name], (list = []) => list.concat(action.response))
  },
  [REMOVE]: (state, action) => {
    const { id, role } = action.requestAction.evaluator
    return setIn(state, ['evaluators', role.name], without(state.evaluators[role.name], { id }))
  },
}

const defaultState = {
  subject: {},
  requirements: {},
  evaluators: [],
  relationships: [],
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
