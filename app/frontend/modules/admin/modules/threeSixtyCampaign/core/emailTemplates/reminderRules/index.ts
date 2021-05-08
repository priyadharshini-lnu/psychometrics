import _ from 'lodash'
import { updateIn } from 'utils/immutable'
import { createReducer } from 'utils/redux'

export const ADD = 'threeSixty/emailTemplates/reminderRules/ADD'
export const UPDATE = 'threeSixty/emailTemplates/reminderRules/UPDATE'
export const REMOVE = 'threeSixty/emailTemplates/reminderRules/REMOVE'
export const REMOVE_ALL = 'threeSixty/emailTemplates/reminderRules/REMOVE_ALL'

export const add = (emailTemplateId: number) => ({ type: ADD, payload: { emailTemplateId } })
export const update = (emailTemplateId: number, index: number, field: string, value) => ({
  type: UPDATE,
  payload: {
    emailTemplateId, index, field, value,
  },
})
export const remove = (emailTemplateId: number, index: number) => ({
  type: REMOVE, payload: { emailTemplateId, index },
})
export const removeAll = (emailTemplateId: number) => ({ type: REMOVE_ALL, payload: { emailTemplateId } })

type UpdateAction = ReturnType<typeof update>
type RemoveAction = ReturnType<typeof remove>

const defaultState = []

const HANDLERS = {
  [ADD]: state => ([...state, { days: null, times: null }]),
  [UPDATE]: (state, { payload: { index, field, value } }: UpdateAction) => updateIn(
    state,
    index,
    rule => ({ ...rule, [field]: value }),
  ),
  [REMOVE]: (state, { payload: { index } }: RemoveAction) => _.filter(state, (_, i: number) => index !== i),
  [REMOVE_ALL]: () => defaultState,
}

export default createReducer(HANDLERS, defaultState)
