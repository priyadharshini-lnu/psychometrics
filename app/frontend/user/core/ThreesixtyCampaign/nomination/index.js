import mockdata from './mockdata'

const FETCH_NOMINATION = 'threeSixty/managers/FETCH_NOMINATION'
const REMOVE_NOMINATION = 'threeSixty/managers/REMOVE_NOMINATION'
const ADD_NOMINATION = 'threeSixty/managers/ADD_NOMINATION'

export const fetchNomination = campaignId => ({
  type: FETCH_NOMINATION,
  request: {
    url: `/campaigns/${campaignId}.json`,
  },
})

export const removeNomination = subject => ({ type: REMOVE_NOMINATION, subject })
export const addNomination = ({ role, name }) => ({ type: ADD_NOMINATION, role, name })


export const defaultState = {}

const HANDLERS = {
  [FETCH_NOMINATION]: (state, action) => state, // do nothing action.data,
  [ADD_NOMINATION]: (state, action) => {
    const { name, role } = action
    const list = _.clone(state.evaluators[role])
    list.subjects.push({ id: Date.now(), name, role })
    return {
      ...state,
      [role]: list,
    }
  },
  [REMOVE_NOMINATION]: (state, action) => {
    const { id, role } = action.subject
    const list = _.clone(state.evaluators[role])
    _.remove(list.subjects, { id })
    return {
      ...state,
      [role]: list,
    }
  },
}

// TODO: replace mockdata with defaultState
export default function reducer (state = mockdata, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
