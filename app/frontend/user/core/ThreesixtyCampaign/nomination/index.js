import { setIn } from 'utils/immutable'

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
      relationship_id: 2,
      evaluator_id: user,
    },
  },
})

const HANDLERS = {
  [FETCH_NOMINATION]: (state, action) => {
    const evaluators = _.groupBy(action.response.evaluators, 'role')

    return {
      ...state, ...action.response, evaluators,
    }
  },
  [ADD_NOMINATION]: (state, action) => {
    const { role } = action.response
    const list = _.clone(state.evaluators[role]) || []
    list.push(action.response)
    return setIn(state, `evaluators.${role}`, list)
  },
  [REMOVE_NOMINATION]: (state, action) => {
    const { id, role } = action.requestAction.evaluator
    const list = _.cloneDeep(state.evaluators)
    _.remove(list[role], { id })
    return {
      ...state,
      evaluators: list,
    }
  },
}

const defaultState = {
  subject: { name: 'Yourself' },
  requirements: {},
  evaluators: [],
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
