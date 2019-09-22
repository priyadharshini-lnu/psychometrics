import _ from 'lodash'
import { updateIn } from 'utils/immutable'
import { takeLatest, put, select } from 'redux-saga/effects'
import { getCurrentCampaignId } from 'admin/core/threeSixtyCampaign/campaignDetails'
import recipientCriteria from './recipientCriteria'

const defaultState = {
  list: [],
}

export const get = state => _.get(state, ['threeSixtyCampaign', 'emailSchedules'])

export const FETCH_SCHEDULABLE_TEMPLATE = 'threeSixty/emailSchedules/FETCH_SCHEDULABLE_TEMPLATE'
export const FETCH_SINGLE = 'threeSixty/emailSchedules/FETCH_SINGLE'
export const UPDATE = 'threeSixty/emailSchedules/UPDATE'
export const CREATE = 'threeSixty/emailSchedules/CREATE'
export const CHANGE_SELECTED = 'threeSixty/emailSchedules/CHANGE_SELECTED'
export const FETCH_RECIPIENT_BY_CRITERIA = 'threeSixty/emailSchedules/FETCH_RECIPIENT_BY_CRITERIA'

export const updateField = (key, value) => ({ type: UPDATE, payload: { key, value } })
export const changeSelected = id => ({ type: CHANGE_SELECTED, payload: { id } })

export const fetchSingle = (campaignId, emailScheduleId) => ({
  type: FETCH_SINGLE,
  campaignId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/${emailScheduleId}`,
  },
})

export const fetchSchedulableTemplate = (campaignId, { selectedEmailTemplateId }) => ({
  type: FETCH_SCHEDULABLE_TEMPLATE,
  campaignId,
  selectedEmailTemplateId,
  request: {
    method: 'get',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/schedulable_templates`,
  },
})

export const fecthRecipientsByCriteria = (campaignId, emailSchedule) => ({
  type: FETCH_RECIPIENT_BY_CRITERIA,
  campaignId,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/recipient_by_criteria`,
    debounce: 500,
    body: {
      emailName: emailSchedule.name,
      recipientCriteria: emailSchedule.recipientCriteria,
    },
  },
})

export const create = (campaignId, emailSchedule, recipientIds) => ({
  type: CREATE,
  request: {
    method: 'post',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/`,
    body: { ...emailSchedule, recipientIds },
  },
})

export const update = (campaignId, emailSchedule, recipientIds) => ({
  type: UPDATE,
  request: {
    method: 'put',
    url: `/administration/threesixty_campaigns/${campaignId}/email_schedules/${emailSchedule.id}`,
    body: { ...emailSchedule, recipientIds },
  },
})

function* genChangeSelectedId ({ requestAction: { selectedEmailTemplateId } }) {
  yield put(changeSelected(selectedEmailTemplateId))
}

export function* genFecthRecipientsByCriteria (options = {}) {
  const emailSchedule = yield select((state) => {
    const emailSchedules = get(state)
    const selectedId = _.get(options, ['requestAction', 'selectedEmailTemplateId'], emailSchedules.selectedId)
    return _.find(emailSchedules.list, ({ id }) => id === selectedId)
  })
  const campaignId = yield select(getCurrentCampaignId)

  yield put(fecthRecipientsByCriteria(campaignId, emailSchedule))
}

const HANDLERS = {
  [FETCH_SCHEDULABLE_TEMPLATE]: (state, { response }) => {
    const scheduledDate = moment().format()
    const list = response.map(emailSchedule => ({ ...emailSchedule, scheduledDate }))
    return { ...state, list }
  },
  [FETCH_SINGLE]: (state, { response }) => {
    const { emailSchedule, recipients } = response
    return {
      ...state, list: [emailSchedule], selectedId: emailSchedule.id, recipients,
    }
  },
  [FETCH_RECIPIENT_BY_CRITERIA]: (state, { response }) => ({ ...state, recipients: response }),
  [UPDATE]: (state, { payload: { key, value } }) => updateIn(
    state,
    'list',
    list => _.map(list, (emailSchedule) => {
      if (emailSchedule.id !== state.selectedId) { return emailSchedule }
      return { ...emailSchedule, [key]: value }
    }),
  ),
  [CHANGE_SELECTED]: (state, { payload: { id } }) => ({ ...state, selectedId: id }),
}

export default function reducer (state = defaultState, action) {
  const index = _.findIndex(state.list, ({ id }) => id === state.selectedId)
  const stateFromInnerReducer = updateIn(
    state, ['list', index, 'recipientCriteria'], state => recipientCriteria(state, action),
  )

  const handler = HANDLERS[action.type]
  return handler ? handler(state, action) : stateFromInnerReducer
}

export const watchers = [
  takeLatest(FETCH_SCHEDULABLE_TEMPLATE, genChangeSelectedId),
  takeLatest([FETCH_SCHEDULABLE_TEMPLATE, CHANGE_SELECTED], genFecthRecipientsByCriteria),
]
