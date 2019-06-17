import _ from 'lodash'
import { updateIn } from 'utils/immutable'
import reminderRulesReducer from './reminderRules'

export const get = state => _.get(state, ['threeSixtyCampaign', 'emailTemplates'])
export const getSelectedId = state => _.get(state, ['threeSixtyCampaign', 'emailTemplates', 'selectedId'])
export const getSelected = (state) => {
  const selectedId = getSelectedId(state)
  return _.find(get(state).list, ({ id }) => id === selectedId)
}

const defaultState = {
  list: [],
}

export const FETCH = 'threeSixty/emailTemplates/FETCH'
export const UPDATE = 'threeSixty/emailTemplates/UPDATE'
export const SAVE = 'threeSixty/emailTemplates/SAVE'
export const CHANGE_SELECTED = 'threeSixty/emailTemplates/CHANGE_SELECTED'

export const update = (key, value) => ({ type: UPDATE, payload: { key, value } })
export const changeSelected = id => ({ type: CHANGE_SELECTED, payload: { id } })

export const fetch = (campaignId, { selectedId }) => ({
  type: FETCH,
  campaignId,
  selectedId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates`,
  },
})

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
  [UPDATE]: (state, { payload: { key, value } }) => updateIn(
    state,
    'list',
    list => _.map(list, (emailTemplate) => {
      if (emailTemplate.id !== state.selectedId) { return emailTemplate }
      return { ...emailTemplate, [key]: value }
    }),
  ),
  [CHANGE_SELECTED]: (state, { payload: { id } }) => ({ ...state, selectedId: id }),
}

export default function reducer (state = defaultState, action) {
  const index = _.findIndex(state.list, ({ id }) => id === state.selectedId)
  const stateFromInnerReducer = updateIn(
    state, ['list', index, 'meta', 'reminderRules'], state => reminderRulesReducer(state, action),
  )

  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : stateFromInnerReducer
}
