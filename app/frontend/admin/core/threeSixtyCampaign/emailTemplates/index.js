
import {
  takeLatest, put, select, delay,
} from 'redux-saga/effects'
import _ from 'lodash'
import { get as getCurrentCampaignId } from '../currentThreeSixtyCampaignId'

export const getEmailTemplates = state => _.get(state, ['threeSixtyCampaign', 'emailTemplates'])

const defaultState = {
  list: [],
}

export const FETCH = 'threeSixty/emailTemplates/FETCH'
export const UPDATE = 'threeSixty/emailTemplates/UPDATE'
export const SAVE = 'threeSixty/emailTemplates/SAVE'
export const CHANGE_SELECTED = 'threeSixty/emailTemplates/CHANGE_SELECTED'

export const fetch = (campaignId, { selectedId }) => ({
  type: FETCH,
  campaignId,
  selectedId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates`,
  },
})

export const update = (key, value) => ({ type: UPDATE, payload: { key, value } })

export const save = (campaignId, emailTemplates) => ({
  type: SAVE,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/email_templates/${emailTemplate.id}`,
    body: { emailTemplates },
  },
})

export const changeSelected = id => ({
  type: CHANGE_SELECTED,
  payload: { id },
})

const HANDLERS = {
  [FETCH]: (state, { response }) => ({ ...state, list: response }),
  [UPDATE]: (state, { payload: { key, value } }) => _.map(state, (emailTemplate) => {
    if (emailTemplate.id !== state.selectedId) { return emailTemplate }
    return { ...emailTemplate, [key]: value }
  }),
  [CHANGE_SELECTED]: (state, { payload: { id } }) => ({ ...state, selectedId: id }),
}

export default function reducer (state = defaultState, action) {
  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : state
}

export const watchers = [
]
