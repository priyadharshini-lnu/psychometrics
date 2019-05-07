import _ from 'lodash'
import { updateIn, setIn } from 'utils/immutable'
import { without } from 'lodash/fp'

const FETCH_NOMINATION = 'threeSixty/managers/FETCH_NOMINATION'
const REMOVE_NOMINATION = 'threeSixty/managers/REMOVE_NOMINATION'
const ADD_NOMINATION = 'threeSixty/managers/ADD_NOMINATION'

export const fetchNomination = ({ campaignId, id }) => ({
  type: FETCH_NOMINATION,
  request: {
    url: `/campaigns/${campaignId}/nominations/${id}`,
  },
})

export const removeNomination = ({ campaignId, nominationId, evaluator }) => ({
  type: REMOVE_NOMINATION,
  evaluator,
  request: {
    url: `/campaigns/${campaignId}/nominations/${nominationId}/evaluations/${evaluator.user.id}`,
    method: 'delete',
  },
})
export const addNomination = ({
  campaignId, nominationId, role, user,
}) => ({
  type: ADD_NOMINATION,
  request: {
    url: `/campaigns/${campaignId}/nominations/${nominationId}/evaluations`,
    method: 'post',
    body: {
      relationship_id: role,
      evaluator_id: user,
    },
  },
})

const HANDLERS = {
  [FETCH_NOMINATION]: (state, action) => {
    const evaluators = _.groupBy(action.response.evaluators, 'role.name')

    return {
      ...state, ...action.response, evaluators,
    }
  },
  [ADD_NOMINATION]: (state, action) => {
    const { role } = action.response
    return updateIn(state, ['evaluators', role.name], (list = []) => list.concat(action.response))
  },
  [REMOVE_NOMINATION]: (state, action) => {
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
