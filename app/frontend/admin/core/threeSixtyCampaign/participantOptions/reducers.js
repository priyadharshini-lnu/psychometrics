import _ from 'lodash'
import { setIn, updateIn } from 'utils/immutable'
import {
  FETCH_PARTICIPANT_OPTIONS,
  UPDATE_PARTICIPANT_OPTIONS,
  ADD_DATASHEET_CRITERIA,
  REMOVE_DATASHEET_CRITERIA,
  UPDATE_DATASHEET_CRITERIA,
} from './actions'

const HANDLERS = {
  [FETCH_PARTICIPANT_OPTIONS]: (_, { response }) => response,
  [UPDATE_PARTICIPANT_OPTIONS]: (state, { payload: { key, value } }) => setIn(state, key, value),
  [ADD_DATASHEET_CRITERIA]: (state, { payload: { key, value } }) => (
    updateIn(state, key, criteriaList => (criteriaList || []).concat([{ field: value, comparator: 'is_same_as_subject' }]))
  ),
  [REMOVE_DATASHEET_CRITERIA]: (state, { payload: { key, index } }) => (
    updateIn(state, key, criteriaList => _.filter(criteriaList, (_, i) => index !== i))
  ),
  [UPDATE_DATASHEET_CRITERIA]: (state, {
    payload: {
      key, index, name, value,
    },
  }) => (
    updateIn(state, [...key, index], criteria => ({ ...criteria, [name]: value }))
  ),
}

const defaultState = { subject: {}, manager: {}, evaluator: {} }

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
