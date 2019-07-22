import _ from 'lodash'
import { updateIn } from 'utils/immutable'
import { get as getEmailSchedules } from '../index'
import { takeLatest, put, select } from 'redux-saga/effects'
import { get as getCurrentCampaignId } from 'admin/core/threeSixtyCampaign/currentThreeSixtyCampaignId'

export const ADD = 'threeSixty/emailSchedule/recipientCriteria/ADD'
export const UPDATE = 'threeSixty/emailSchedule/recipientCriteria/UPDATE'
export const MERGE = 'threeSixty/emailSchedule/recipientCriteria/MERGE'
export const REMOVE = 'threeSixty/emailSchedule/recipientCriteria/REMOVE'
export const FETCH_RECIPIENT_BY_CRITERIA = 'threeSixty/emailSchedules/FETCH_RECIPIENT_BY_CRITERIA'

export const fecthRecipientsByCriteria = (campaignId, emailSchedule) => ({
  type: FETCH_RECIPIENT_BY_CRITERIA,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/receipient_by_criteria`,
    body: {
      emailName: emailSchedule.name,
      recipientCriteria: emailSchedule.recipientCriteria,
    }
  },
})

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

export function* genFecthRecipientsByCriteria(options = {}) {
  const emailSchedule = yield select((state) => {
    const emailSchedules = getEmailSchedules(state)
    const selectedId = _.get(options, ['requestAction', 'selectedEmailTemplateId'], emailSchedules.selectedId)
    return _.find(emailSchedules.list, ({ id }) => id === selectedId)
  })
  const campaignId = yield select(getCurrentCampaignId)

  yield put(fecthRecipientsByCriteria(campaignId, emailSchedule))
}

export const watchers = [
  takeLatest([ADD, UPDATE, MERGE, REMOVE], genFecthRecipientsByCriteria),
]
