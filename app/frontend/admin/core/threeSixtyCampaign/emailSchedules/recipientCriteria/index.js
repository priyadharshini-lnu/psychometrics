import _ from 'lodash'
import { updateIn } from 'utils/immutable'

export const ADD = 'threeSixty/emailSchedule/recipientCriteria/ADD'
export const UPDATE = 'threeSixty/emailSchedule/recipientCriteria/UPDATE'
export const MERGE = 'threeSixty/emailSchedule/recipientCriteria/MERGE'
export const REMOVE = 'threeSixty/emailSchedule/recipientCriteria/REMOVE'

export const add = () => ({ type: ADD })
export const update = (index, field, value) => ({
  type: UPDATE,
  payload: {
    index, field, value,
  },
})
export const merge = (index, attributes) => ({
  type: MERGE,
  payload: {
    index, attributes,
  },
})
export const remove = index => ({ type: REMOVE, payload: { index } })

const defaultState = []
const HANDLERS = {
  [ADD]: state => ([...state, { field: 'name_or_email', comparator: 'equal', value: null }]),
  [UPDATE]: (state, { payload: { index, field, value } }) => updateIn(
    state,
    index,
    recipientCriteria => ({ ...recipientCriteria, [field]: value }),
  ),
  [MERGE]: (state, { payload: { index, attributes } }) => updateIn(
    state,
    index,
    recipientCriteria => ({ ...recipientCriteria, ...attributes }),
  ),
  [REMOVE]: (state, { payload: { index } }) => _.filter(state, (_, i) => index !== i),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
