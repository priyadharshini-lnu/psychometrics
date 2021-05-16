import _ from 'lodash'
import { setIn, updateIn } from 'utils/immutable'
import { createReducer } from 'utils/redux'
import { ApiActionResponse } from 'interfaces/ApiActionResponse'
import {
  FETCH_PARTICIPANT_OPTIONS,
  UPDATE_PARTICIPANT_OPTIONS,
  ADD_DATASHEET_CRITERIA,
  REMOVE_DATASHEET_CRITERIA,
  UPDATE_DATASHEET_CRITERIA,
  UPDATE_RELATIONSHIP,
  UpdateRelationshipType, UpdateDatasheetCriteriaType,
  RemoveDatasheetCriteriaType, UpdateType, AddDatasheetCriteriaType,
} from './actions'


interface State {
  subject: {
    canSelectRelationships: {},
  },
  manager: {},
  evaluator: {},
  global: {},
  relationships: [],
}

export type FetchAction = ApiActionResponse<State>


const HANDLERS = {
  [FETCH_PARTICIPANT_OPTIONS]: (_, { response }: FetchAction) => response,
  [UPDATE_PARTICIPANT_OPTIONS]: (state: State, { payload: { key, value } }: UpdateType) => setIn(state, key, value),
  [ADD_DATASHEET_CRITERIA]: (state: State, { payload: { key, value } }: AddDatasheetCriteriaType) => (
    updateIn(
      state,
      key,
      criteriaList => (criteriaList || []).concat([{ field: value, comparator: 'is_same_as_subject' }]),
    )
  ),
  [REMOVE_DATASHEET_CRITERIA]: (state: State, { payload: { key, index } }: RemoveDatasheetCriteriaType) => (
    updateIn(state, key, criteriaList => _.filter(criteriaList, (_, i: number) => index !== i))
  ),
  [UPDATE_DATASHEET_CRITERIA]: (state: State, {
    payload: {
      key, index, name, value,
    },
  }: UpdateDatasheetCriteriaType) => (
    updateIn(state, [...key, index], criteria => ({ ...criteria, [name]: value }))
  ),
  [UPDATE_RELATIONSHIP]: (state: State, { payload: { key, id, value } }: UpdateRelationshipType) => (
    updateIn(
      state,
      [key, 'canSelectRelationships'],
      hash => Object.assign({}, hash, { [id]: value }),
    )
  ),
}

const defaultState: State = {
  subject: {
    canSelectRelationships: {},
  },
  manager: {},
  evaluator: {},
  global: {},
  relationships: [],
}

export default createReducer(HANDLERS, defaultState)
