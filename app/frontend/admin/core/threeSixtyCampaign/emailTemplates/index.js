import _ from 'lodash'
import { updateIn } from 'utils/immutable'
<<<<<<< HEAD
import reminderRulesReducer from './reminderRules'
=======
>>>>>>> Backed fo email template

export const get = state => _.get(state, ['threeSixtyCampaign', 'emailTemplates'])

const defaultState = {
  list: [],
}

export const FETCH = 'threeSixty/emailTemplates/FETCH'
export const UPDATE = 'threeSixty/emailTemplates/UPDATE'
export const SAVE = 'threeSixty/emailTemplates/SAVE'
export const CHANGE_SELECTED = 'threeSixty/emailTemplates/CHANGE_SELECTED'

export const update = (id, key, value) => ({ type: UPDATE, payload: { id, key, value } })

export const fetch = campaignId => ({
  type: FETCH,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates`,
  },
})

<<<<<<< HEAD
=======
export const update = (key, value) => ({ type: UPDATE, payload: { key, value } })

>>>>>>> Backed fo email template
export const save = (campaignId, emailTemplate) => ({
  type: SAVE,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates/${emailTemplate.id}`,
    body: { emailTemplate },
  },
})


const HANDLERS = {
  [FETCH]: (state, { response }) => ({ ...state, list: response }),
<<<<<<< HEAD
  [UPDATE]: (state, { payload: { id, key, value } }) => updateIn(
    state,
    'list',
    list => _.map(list, (emailTemplate) => {
      if (emailTemplate.id !== id) { return emailTemplate }
      return { ...emailTemplate, [key]: value }
    }),
  ),
=======
  [UPDATE]: (state, { payload: { key, value } }) => updateIn(
    state,
    'list',
    list => _.map(list, (emailTemplate) => {
      if (emailTemplate.id !== state.selectedId) { return emailTemplate }
      return { ...emailTemplate, [key]: value }
    }),
  ),
  [CHANGE_SELECTED]: (state, { payload: { id } }) => ({ ...state, selectedId: id }),
>>>>>>> Backed fo email template
}

export default function reducer (state = defaultState, action) {
  const index = _.findIndex(state.list, ({ id }) => id === _.get(action, ['payload', 'emailTemplateId']))
  const stateFromInnerReducer = updateIn(
    state, ['list', index, 'meta', 'reminderRules'], state => reminderRulesReducer(state, action),
  )

  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : stateFromInnerReducer
}
