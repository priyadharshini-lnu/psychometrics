import _ from 'lodash'
import { updateIn } from 'utils/immutable'

export const ADD = 'threeSixty/emailTemplates/reminderRules/ADD'
export const UPDATE = 'threeSixty/emailTemplates/reminderRules/UPDATE'
export const REMOVE = 'threeSixty/emailTemplates/reminderRules/REMOVE'
export const REMOVE_ALL = 'threeSixty/emailTemplates/reminderRules/REMOVE_ALL'

export const add = emailTemplateId => ({ type: ADD, payload: { emailTemplateId } })
export const update = (emailTemplateId, index, field, value) => ({
  type: UPDATE,
  payload: {
    emailTemplateId, index, field, value,
  },
})
export const remove = (emailTemplateId, index) => ({ type: REMOVE, payload: { emailTemplateId, index } })
export const removeAll = emailTemplateId => ({ type: REMOVE_ALL, payload: { emailTemplateId } })

const defaultState = []
const HANDLERS = {
  [ADD]: state => ([...state, { days: null, times: null }]),
  [UPDATE]: (state, { payload: { index, field, value } }) => updateIn(
    state,
    index,
    rule => ({ ...rule, [field]: value }),
  ),
  [REMOVE]: (state, { payload: { index } }) => _.filter(state, (_, i) => index !== i),
  [REMOVE_ALL]: () => defaultState,
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}
