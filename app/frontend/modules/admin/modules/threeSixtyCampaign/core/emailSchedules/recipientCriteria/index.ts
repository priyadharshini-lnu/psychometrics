import _ from 'lodash'
import { updateIn } from 'utils/immutable'
import { takeLatest } from 'redux-saga/effects'
import { createReducer } from 'utils/redux'
import { genFecthRecipientsByCriteria } from '../index'

export const ADD = 'threeSixty/emailSchedule/recipientCriteria/ADD'
export const UPDATE = 'threeSixty/emailSchedule/recipientCriteria/UPDATE'
export const MERGE = 'threeSixty/emailSchedule/recipientCriteria/MERGE'
export const REMOVE = 'threeSixty/emailSchedule/recipientCriteria/REMOVE'

export const add = () => ({ type: ADD })
export const update = (index: number, field: string, value: number) => ({
  type: UPDATE,
  payload: {
    index, field, value,
  },
})
export const merge = (index: number, attributes: {value: number, subField?: string, comparator: string}) => ({
  type: MERGE,
  payload: {
    index, attributes,
  },
})
export const remove = (index: number) => ({ type: REMOVE, payload: { index } })

const defaultState = []

type UpdateAction = ReturnType<typeof update>
type MergeAction = ReturnType<typeof merge>
type RemoveAction = ReturnType<typeof merge>

const HANDLERS = {
  [ADD]: state => ([...state, { field: 'name_or_email', comparator: 'equal', value: null }]),
  [UPDATE]: (state, { payload: { index, field, value } }: UpdateAction) => updateIn(
    state,
    index,
    recipientCriteria => ({ ...recipientCriteria, [field]: value }),
  ),
  [MERGE]: (state, { payload: { index, attributes } }: MergeAction) => updateIn(
    state,
    index,
    recipientCriteria => ({ ...recipientCriteria, ...attributes }),
  ),
  [REMOVE]: (state, { payload: { index } }: RemoveAction) => _.filter(state, (_, i: number) => index !== i),
}

export default createReducer(HANDLERS, defaultState)

export const watchers = [
  takeLatest([ADD, UPDATE, MERGE, REMOVE], genFecthRecipientsByCriteria),
]
